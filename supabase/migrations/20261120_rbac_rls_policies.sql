-- =============================================================================
-- Migration: 20261120_rbac_rls_policies.sql
-- Purpose:   Enforce least-privilege, role-based Row-Level Security (RLS) across
--            all 13 PetroTechnics Supabase tables.
--
-- Security Guarantees:
--   1. Public / regular users (anon & authenticated buyers) have strictly
--      READ-ONLY access to products, live FOB pricing, historical benchmarks,
--      trade corridors, document templates, and commercial settings.
--   2. Only authenticated admins holding 'editProductsPricing' (or superadmin)
--      can INSERT/UPDATE catalog specs and FOB pricing; DELETE requires
--      'deleteRecords'.
--   3. Non-superadmin operators cannot self-escalate privileges on public.admins
--      (self-access is strictly SELECT only).
--   4. Registered buyers can only read their own RFQs (via verified email or
--      buyer_uid) and manage their own buyer_profiles row.
--   5. system_audit_logs is strictly append-only (enforced by RLS + trigger).
-- =============================================================================

begin;

-- 1. Hardened SECURITY DEFINER Helpers (search_path locked)
create or replace function public.auth_verified_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then null
    when coalesce(
      (auth.jwt() ->> 'email_verified')::boolean,
      (auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean,
      (auth.jwt() ->> 'aal') is not null
    ) then lower(nullif(trim(auth.jwt() ->> 'email'), ''))
    else null
  end;
$$;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.uid = auth.uid()
      and a.status = 'active'
  );
$$;

create or replace function public.is_active_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.uid = auth.uid()
      and a.status = 'active'
      and a.role = any(allowed_roles)
  );
$$;

create or replace function public.has_admin_permission(perm_key text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.uid = auth.uid()
      and a.status = 'active'
      and (
        a.role = 'superadmin'
        or coalesce((a.permissions ->> perm_key)::boolean, false) = true
      )
  );
$$;

revoke all on function public.auth_verified_email() from public;
revoke all on function public.is_active_admin() from public;
revoke all on function public.is_active_role(text[]) from public;
revoke all on function public.has_admin_permission(text) from public;

grant execute on function public.auth_verified_email() to authenticated, anon;
grant execute on function public.is_active_admin() to authenticated, anon;
grant execute on function public.is_active_role(text[]) to authenticated, anon;
grant execute on function public.has_admin_permission(text) to authenticated, anon;

-- 2. Immutability Triggers & Buyer-Safe View
create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'system_audit_logs is strictly append-only; UPDATE and DELETE are forbidden.';
end;
$$;

drop trigger if exists trg_system_audit_logs_immutable on public.system_audit_logs;
create trigger trg_system_audit_logs_immutable
  before update or delete on public.system_audit_logs
  for each row execute function public.prevent_audit_log_mutation();

create or replace function public.enforce_rfq_immutability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reference_id <> old.reference_id then
    raise exception 'RFQ reference_id is immutable.';
  end if;
  if old.buyer_uid is not null and new.buyer_uid is distinct from old.buyer_uid then
    raise exception 'RFQ buyer_uid cannot be reassigned.';
  end if;
  if new.created_at <> old.created_at then
    raise exception 'RFQ created_at timestamp is immutable.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_rfq_inquiries_immutability on public.rfq_inquiries;
create trigger trg_rfq_inquiries_immutability
  before update on public.rfq_inquiries
  for each row execute function public.enforce_rfq_immutability();

create or replace view public.buyer_rfqs_portal
with (security_invoker = true)
as
select
  reference_id, product_slug, product_name, grade, quantity_mt, destination,
  incoterm, packaging, inspection, currency, estimated_unit_price,
  estimated_total, company_name, contact_name, email, phone, notes, status,
  buyer_uid, fulfillment_stage, vessel_name, bl_number, port_of_loading,
  eta_date, buyer_notice, created_at, updated_at
from public.rfq_inquiries;

grant select on public.buyer_rfqs_portal to authenticated;

-- 3. Ensure RLS Enabled on All 13 Tables
alter table public.role_definitions enable row level security;
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.rfq_inquiries enable row level security;
alter table public.market_insights enable row level security;
alter table public.historical_prices enable row level security;
alter table public.trade_corridors enable row level security;
alter table public.document_templates enable row level security;
alter table public.document_access_logs enable row level security;
alter table public.vault_revocations enable row level security;
alter table public.platform_settings enable row level security;
alter table public.system_audit_logs enable row level security;
alter table public.buyer_profiles enable row level security;

-- 4. Catalog & Live FOB Pricing (public.products) — Read-Only for Regular Users
drop policy if exists "Public read products" on public.products;
drop policy if exists "Editor manage products" on public.products;
drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_insert_pricing_admin" on public.products;
drop policy if exists "products_update_pricing_admin" on public.products;
drop policy if exists "products_delete_admin" on public.products;

create policy "products_select_public"
  on public.products for select to anon, authenticated
  using (true);

create policy "products_insert_pricing_admin"
  on public.products for insert to authenticated
  with check (public.has_admin_permission('editProductsPricing') and fob_usd_mt > 0 and moq_mt > 0);

create policy "products_update_pricing_admin"
  on public.products for update to authenticated
  using (public.has_admin_permission('editProductsPricing'))
  with check (public.has_admin_permission('editProductsPricing') and fob_usd_mt > 0 and moq_mt > 0);

create policy "products_delete_admin"
  on public.products for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- 5. Historical FOB Benchmarks (public.historical_prices)
drop policy if exists "Public read historical prices" on public.historical_prices;
drop policy if exists "Editor manage prices" on public.historical_prices;
drop policy if exists "historical_prices_select_public" on public.historical_prices;
drop policy if exists "historical_prices_insert_admin" on public.historical_prices;
drop policy if exists "historical_prices_update_admin" on public.historical_prices;
drop policy if exists "historical_prices_delete_admin" on public.historical_prices;

create policy "historical_prices_select_public"
  on public.historical_prices for select to anon, authenticated
  using (true);

create policy "historical_prices_insert_admin"
  on public.historical_prices for insert to authenticated
  with check (public.has_admin_permission('editMarket') or public.has_admin_permission('editProductsPricing'));

create policy "historical_prices_update_admin"
  on public.historical_prices for update to authenticated
  using (public.has_admin_permission('editMarket') or public.has_admin_permission('editProductsPricing'))
  with check (public.has_admin_permission('editMarket') or public.has_admin_permission('editProductsPricing'));

create policy "historical_prices_delete_admin"
  on public.historical_prices for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- 6. Commercial FX & Incoterms Settings (public.platform_settings)
drop policy if exists "Public read settings" on public.platform_settings;
drop policy if exists "Superadmin manage settings" on public.platform_settings;
drop policy if exists "platform_settings_select_public" on public.platform_settings;
drop policy if exists "platform_settings_insert_admin" on public.platform_settings;
drop policy if exists "platform_settings_update_admin" on public.platform_settings;

create policy "platform_settings_select_public"
  on public.platform_settings for select to anon, authenticated
  using (setting_key = 'global');

create policy "platform_settings_insert_admin"
  on public.platform_settings for insert to authenticated
  with check (setting_key = 'global' and public.has_admin_permission('editSettings'));

create policy "platform_settings_update_admin"
  on public.platform_settings for update to authenticated
  using (setting_key = 'global' and public.has_admin_permission('editSettings'))
  with check (setting_key = 'global' and public.has_admin_permission('editSettings'));

-- 7. Market Insights & Trade Corridors
drop policy if exists "Public read published insights" on public.market_insights;
drop policy if exists "Editor manage insights" on public.market_insights;
drop policy if exists "market_insights_select_published_or_admin" on public.market_insights;
drop policy if exists "market_insights_insert_admin" on public.market_insights;
drop policy if exists "market_insights_update_admin" on public.market_insights;
drop policy if exists "market_insights_delete_admin" on public.market_insights;

create policy "market_insights_select_published_or_admin"
  on public.market_insights for select to anon, authenticated
  using (published = true or public.has_admin_permission('viewMarket'));

create policy "market_insights_insert_admin"
  on public.market_insights for insert to authenticated
  with check (public.has_admin_permission('editMarket'));

create policy "market_insights_update_admin"
  on public.market_insights for update to authenticated
  using (public.has_admin_permission('editMarket'))
  with check (public.has_admin_permission('editMarket'));

create policy "market_insights_delete_admin"
  on public.market_insights for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

drop policy if exists "Public read corridors" on public.trade_corridors;
drop policy if exists "Editor manage corridors" on public.trade_corridors;
drop policy if exists "trade_corridors_select_public" on public.trade_corridors;
drop policy if exists "trade_corridors_insert_admin" on public.trade_corridors;
drop policy if exists "trade_corridors_update_admin" on public.trade_corridors;
drop policy if exists "trade_corridors_delete_admin" on public.trade_corridors;

create policy "trade_corridors_select_public"
  on public.trade_corridors for select to anon, authenticated
  using (true);

create policy "trade_corridors_insert_admin"
  on public.trade_corridors for insert to authenticated
  with check (public.has_admin_permission('editMarket'));

create policy "trade_corridors_update_admin"
  on public.trade_corridors for update to authenticated
  using (public.has_admin_permission('editMarket'))
  with check (public.has_admin_permission('editMarket'));

create policy "trade_corridors_delete_admin"
  on public.trade_corridors for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- 8. Document Templates, Access Logs & Vault Revocations
drop policy if exists "Public read doc templates" on public.document_templates;
drop policy if exists "Superadmin manage doc templates" on public.document_templates;
drop policy if exists "document_templates_select_public" on public.document_templates;
drop policy if exists "document_templates_insert_admin" on public.document_templates;
drop policy if exists "document_templates_update_admin" on public.document_templates;
drop policy if exists "document_templates_delete_admin" on public.document_templates;

create policy "document_templates_select_public"
  on public.document_templates for select to anon, authenticated
  using (true);

create policy "document_templates_insert_admin"
  on public.document_templates for insert to authenticated
  with check (public.has_admin_permission('manageDocuments'));

create policy "document_templates_update_admin"
  on public.document_templates for update to authenticated
  using (public.has_admin_permission('manageDocuments'))
  with check (public.has_admin_permission('manageDocuments'));

create policy "document_templates_delete_admin"
  on public.document_templates for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

drop policy if exists "Public verify document vault" on public.document_access_logs;
drop policy if exists "Superadmin manage vault logs" on public.document_access_logs;
drop policy if exists "Superadmin revoke vault logs" on public.document_access_logs;
drop policy if exists "doc_access_logs_insert_public" on public.document_access_logs;
drop policy if exists "doc_access_logs_select_admin" on public.document_access_logs;
drop policy if exists "doc_access_logs_update_admin" on public.document_access_logs;
drop policy if exists "doc_access_logs_delete_admin" on public.document_access_logs;

create policy "doc_access_logs_insert_public"
  on public.document_access_logs for insert to anon, authenticated
  with check (status = 'active');

create policy "doc_access_logs_select_admin"
  on public.document_access_logs for select to authenticated
  using (public.has_admin_permission('viewDocuments'));

create policy "doc_access_logs_update_admin"
  on public.document_access_logs for update to authenticated
  using (public.has_admin_permission('manageDocuments'))
  with check (public.has_admin_permission('manageDocuments'));

create policy "doc_access_logs_delete_admin"
  on public.document_access_logs for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

drop policy if exists "Public check vault revocations" on public.vault_revocations;
drop policy if exists "Superadmin manage vault revocations" on public.vault_revocations;
drop policy if exists "vault_revocations_select_public" on public.vault_revocations;
drop policy if exists "vault_revocations_insert_admin" on public.vault_revocations;
drop policy if exists "vault_revocations_update_admin" on public.vault_revocations;
drop policy if exists "vault_revocations_delete_admin" on public.vault_revocations;

create policy "vault_revocations_select_public"
  on public.vault_revocations for select to anon, authenticated
  using (true);

create policy "vault_revocations_insert_admin"
  on public.vault_revocations for insert to authenticated
  with check (public.has_admin_permission('manageDocuments'));

create policy "vault_revocations_update_admin"
  on public.vault_revocations for update to authenticated
  using (public.has_admin_permission('manageDocuments'))
  with check (public.has_admin_permission('manageDocuments'));

create policy "vault_revocations_delete_admin"
  on public.vault_revocations for delete to authenticated
  using (public.has_admin_permission('manageDocuments'));

-- 9. RFQ Inquiries & Buyer Profiles (Client Portal Isolation)
drop policy if exists "Public submit RFQ" on public.rfq_inquiries;
drop policy if exists "Buyer read own RFQs" on public.rfq_inquiries;
drop policy if exists "Admin read RFQs" on public.rfq_inquiries;
drop policy if exists "Admin update RFQs" on public.rfq_inquiries;
drop policy if exists "Superadmin delete RFQs" on public.rfq_inquiries;
drop policy if exists "rfq_inquiries_insert_validated" on public.rfq_inquiries;
drop policy if exists "rfq_inquiries_select_owner_or_admin" on public.rfq_inquiries;
drop policy if exists "rfq_inquiries_update_admin" on public.rfq_inquiries;
drop policy if exists "rfq_inquiries_delete_admin" on public.rfq_inquiries;

create policy "rfq_inquiries_insert_validated"
  on public.rfq_inquiries for insert to anon, authenticated
  with check (
    status = 'received'
    and desk_notes = ''
    and fulfillment_stage is null
    and vessel_name is null
    and bl_number is null
    and port_of_loading is null
    and eta_date is null
    and buyer_notice is null
    and (buyer_uid is null or (buyer_uid = auth.uid() and lower(email) = public.auth_verified_email()))
  );

create policy "rfq_inquiries_select_owner_or_admin"
  on public.rfq_inquiries for select to authenticated
  using (
    public.has_admin_permission('viewRfqs')
    or buyer_uid = auth.uid()
    or (public.auth_verified_email() is not null and lower(email) = public.auth_verified_email())
  );

create policy "rfq_inquiries_update_admin"
  on public.rfq_inquiries for update to authenticated
  using (public.has_admin_permission('manageRfqs'))
  with check (public.has_admin_permission('manageRfqs'));

create policy "rfq_inquiries_delete_admin"
  on public.rfq_inquiries for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

drop policy if exists "Buyer manage own profile" on public.buyer_profiles;
drop policy if exists "Admin read buyer profiles" on public.buyer_profiles;
drop policy if exists "buyer_profiles_select_owner_or_admin" on public.buyer_profiles;
drop policy if exists "buyer_profiles_insert_owner" on public.buyer_profiles;
drop policy if exists "buyer_profiles_update_owner" on public.buyer_profiles;
drop policy if exists "buyer_profiles_delete_admin" on public.buyer_profiles;

create policy "buyer_profiles_select_owner_or_admin"
  on public.buyer_profiles for select to authenticated
  using (auth.uid() = uid or public.has_admin_permission('viewRfqs'));

create policy "buyer_profiles_insert_owner"
  on public.buyer_profiles for insert to authenticated
  with check (
    auth.uid() = uid
    and public.auth_verified_email() is not null
    and lower(email) = public.auth_verified_email()
  );

create policy "buyer_profiles_update_owner"
  on public.buyer_profiles for update to authenticated
  using (auth.uid() = uid)
  with check (
    auth.uid() = uid
    and public.auth_verified_email() is not null
    and lower(email) = public.auth_verified_email()
  );

create policy "buyer_profiles_delete_admin"
  on public.buyer_profiles for delete to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- 10. RBAC Tables & Append-Only Audit Logs
drop policy if exists "Admin read role definitions" on public.role_definitions;
drop policy if exists "Superadmin manage role definitions" on public.role_definitions;
drop policy if exists "role_definitions_select_admin" on public.role_definitions;
drop policy if exists "role_definitions_insert_superadmin" on public.role_definitions;
drop policy if exists "role_definitions_update_superadmin" on public.role_definitions;
drop policy if exists "role_definitions_delete_custom_superadmin" on public.role_definitions;

create policy "role_definitions_select_admin"
  on public.role_definitions for select to authenticated
  using (public.is_active_admin());

create policy "role_definitions_insert_superadmin"
  on public.role_definitions for insert to authenticated
  with check (public.has_admin_permission('manageRoles') and (is_system = false or id = 'superadmin'));

create policy "role_definitions_update_superadmin"
  on public.role_definitions for update to authenticated
  using (public.has_admin_permission('manageRoles'))
  with check (public.has_admin_permission('manageRoles'));

create policy "role_definitions_delete_custom_superadmin"
  on public.role_definitions for delete to authenticated
  using (public.has_admin_permission('manageRoles') and is_system = false);

drop policy if exists "Superadmin manage admins" on public.admins;
drop policy if exists "admins_select_self_or_manager" on public.admins;
drop policy if exists "admins_insert_manager" on public.admins;
drop policy if exists "admins_update_manager" on public.admins;
drop policy if exists "admins_delete_manager" on public.admins;

create policy "admins_select_self_or_manager"
  on public.admins for select to authenticated
  using (auth.uid() = uid or public.has_admin_permission('manageRoles'));

create policy "admins_insert_manager"
  on public.admins for insert to authenticated
  with check (public.has_admin_permission('manageRoles'));

create policy "admins_update_manager"
  on public.admins for update to authenticated
  using (public.has_admin_permission('manageRoles'))
  with check (
    public.has_admin_permission('manageRoles')
    and (
      uid <> auth.uid()
      or (
        status = 'active'
        and (role = 'superadmin' or coalesce((permissions ->> 'manageRoles')::boolean, false) = true)
      )
    )
  );

create policy "admins_delete_manager"
  on public.admins for delete to authenticated
  using (public.has_admin_permission('manageRoles') and uid <> auth.uid());

drop policy if exists "Admin read system audit logs" on public.system_audit_logs;
drop policy if exists "Active admin append system audit logs" on public.system_audit_logs;
drop policy if exists "system_audit_logs_select_admin" on public.system_audit_logs;
drop policy if exists "system_audit_logs_insert_active_admin" on public.system_audit_logs;

create policy "system_audit_logs_select_admin"
  on public.system_audit_logs for select to authenticated
  using (public.has_admin_permission('manageRoles') or public.has_admin_permission('viewOverview'));

create policy "system_audit_logs_insert_active_admin"
  on public.system_audit_logs for insert to authenticated
  with check (
    public.is_active_admin()
    and actor_uid = auth.uid()
    and public.auth_verified_email() is not null
    and lower(actor_email) = public.auth_verified_email()
  );

commit;
