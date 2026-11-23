-- =============================================================================
-- PetroTechnics — Supabase (PostgreSQL) Production Schema & Row-Level Security
-- Covers all 13 live PetroTechnics tables with granular RBAC RLS policies,
-- strict admin-only catalog/pricing mutations, read-only public access,
-- buyer self-service isolation, and tamper-proof append-only audit logging.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Granular Role Definitions (Access Level Templates)
-- -----------------------------------------------------------------------------
create table if not exists public.role_definitions (
  id text primary key,
  name text not null,
  description text not null,
  base_tier text not null check (base_tier in ('superadmin', 'editor', 'desk_agent', 'analyst')),
  is_system boolean not null default false,
  permissions jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed baseline institutional RBAC role templates (idempotent)
insert into public.role_definitions (id, name, description, base_tier, is_system, permissions)
values
  (
    'superadmin',
    'Superadmin',
    'Full unrestricted control over pricing, RFQs, market intelligence, settings, roles, and record deletion.',
    'superadmin',
    true,
    '{"viewOverview":true,"viewProducts":true,"editProductsPricing":true,"viewRfqs":true,"manageRfqs":true,"viewMarket":true,"editMarket":true,"viewDocuments":true,"manageDocuments":true,"editSettings":true,"manageRoles":true,"deleteRecords":true}'::jsonb
  ),
  (
    'pricing_manager',
    'Pricing Manager',
    'Manages product catalog specifications, live FOB pricing, historical price benchmarks, and FX/Incoterm settings.',
    'editor',
    false,
    '{"viewOverview":true,"viewProducts":true,"editProductsPricing":true,"viewRfqs":true,"manageRfqs":false,"viewMarket":true,"editMarket":true,"viewDocuments":true,"manageDocuments":false,"editSettings":true,"manageRoles":false,"deleteRecords":false}'::jsonb
  ),
  (
    'sales_lead',
    'Sales Lead',
    'Owns the commercial RFQ pipeline, FCO issuance, active shipment fulfillment updates, and buyer document vault.',
    'desk_agent',
    false,
    '{"viewOverview":true,"viewProducts":true,"editProductsPricing":false,"viewRfqs":true,"manageRfqs":true,"viewMarket":true,"editMarket":false,"viewDocuments":true,"manageDocuments":true,"editSettings":false,"manageRoles":false,"deleteRecords":false}'::jsonb
  ),
  (
    'readonly_analyst',
    'Read-Only Analyst',
    'Audits commercial pipeline metrics, catalog pricing, market trends, and audit logs without write privileges.',
    'analyst',
    false,
    '{"viewOverview":true,"viewProducts":true,"editProductsPricing":false,"viewRfqs":true,"manageRfqs":false,"viewMarket":true,"editMarket":false,"viewDocuments":true,"manageDocuments":false,"editSettings":false,"manageRoles":false,"deleteRecords":false}'::jsonb
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. RBAC Admins Directory
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null check (role in ('superadmin', 'editor', 'desk_agent', 'analyst')),
  role_id text not null references public.role_definitions(id),
  role_name text not null,
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. Petrochemical Product Catalog & Live FOB Pricing
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  slug text primary key,
  category text not null check (category in ('polymers', 'fertilizers', 'chemicals')),
  short_name text not null,
  formula text not null,
  cas_number text not null,
  hs_code text not null,
  moq_mt numeric not null check (moq_mt > 0),
  fob_usd_mt numeric not null check (fob_usd_mt > 0),
  image text not null,
  featured boolean not null default false,
  name jsonb not null,
  summary jsonb not null,
  overview jsonb not null,
  grades jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  applications jsonb not null default '[]'::jsonb,
  packaging jsonb not null default '[]'::jsonb,
  loading_ports text[] not null default '{}',
  inspections text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Buyer RFQ Inquiries & Active Shipment Fulfillment Pipeline
-- -----------------------------------------------------------------------------
create table if not exists public.rfq_inquiries (
  reference_id text primary key,
  product_slug text not null,
  product_name text not null,
  grade text not null,
  quantity_mt numeric not null check (quantity_mt > 0),
  destination text not null,
  incoterm text not null check (incoterm in ('FOB', 'CFR', 'CIF', 'FCA', 'CPT', 'DAP')),
  packaging text not null,
  inspection text not null check (inspection in ('SGS', 'Bureau Veritas', 'Intertek')),
  currency text not null default 'USD' check (currency in ('USD', 'EUR', 'AED')),
  estimated_unit_price numeric not null default 0 check (estimated_unit_price >= 0),
  estimated_total numeric not null default 0 check (estimated_total >= 0),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text not null,
  notes text not null default '',
  status text not null default 'received' check (status in ('received', 'reviewing', 'quoted', 'contracted', 'archived')),
  desk_notes text not null default '',
  buyer_uid uuid references auth.users(id),
  fulfillment_stage text check (fulfillment_stage in ('allocation', 'lc_opened', 'sgs_inspection', 'port_loading', 'in_transit', 'delivered')),
  vessel_name text,
  bl_number text,
  port_of_loading text,
  eta_date text,
  buyer_notice text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rfq_inquiries_email_lower on public.rfq_inquiries (lower(email));
create index if not exists idx_rfq_inquiries_buyer_uid on public.rfq_inquiries (buyer_uid);

-- -----------------------------------------------------------------------------
-- 5. Trilingual Market Insights
-- -----------------------------------------------------------------------------
create table if not exists public.market_insights (
  slug text primary key,
  category text not null check (category in ('fertilizers', 'polymers', 'finance', 'logistics')),
  category_label jsonb not null,
  date text not null,
  read_time_minutes int not null check (read_time_minutes >= 1),
  image text not null,
  title jsonb not null,
  excerpt jsonb not null,
  sections jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 6. Historical FOB Price Benchmarks (Recharts)
-- -----------------------------------------------------------------------------
create table if not exists public.historical_prices (
  id text primary key,
  month text not null,
  sort_order int not null,
  urea numeric not null check (urea > 0),
  hdpe numeric not null check (hdpe > 0),
  pp numeric not null check (pp > 0),
  methanol numeric not null check (methanol > 0),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 7. Global Trade Corridors (D3 Map)
-- -----------------------------------------------------------------------------
create table if not exists public.trade_corridors (
  id text primary key,
  mode_code text not null check (mode_code in ('maritime', 'caspian', 'overland', 'gulf')),
  region jsonb not null,
  mode jsonb not null,
  loading_ports text[] not null,
  destinations jsonb not null,
  transit_days text not null,
  commodities text[] not null,
  summary jsonb not null,
  origin_point jsonb not null,
  target_point jsonb not null,
  curve_control jsonb not null,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 8. Institutional Document Hub Templates
-- -----------------------------------------------------------------------------
create table if not exists public.document_templates (
  id text primary key,
  code text not null,
  category text not null check (category in ('commercial', 'shipping', 'inspection')),
  revision text not null,
  sha256 text not null,
  stage_ref text not null,
  issuer jsonb not null,
  title jsonb not null,
  summary jsonb not null,
  document_title_en text not null,
  subtitle_en text not null,
  metadata jsonb not null,
  table_headers text[] not null,
  line_items jsonb not null,
  clauses text[] not null,
  signatory text not null,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 9. Document Vault Buyer Verification Audit Logs (PII Protected)
-- -----------------------------------------------------------------------------
create table if not exists public.document_access_logs (
  token text primary key,
  company text not null,
  email text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  verified_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 10. Non-PII Vault Revocation Registry
-- -----------------------------------------------------------------------------
create table if not exists public.vault_revocations (
  token text primary key references public.document_access_logs(token) on delete cascade,
  revoked boolean not null default true,
  revoked_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 11. Global Commercial Settings (FX Rates, Incoterm Deltas, Desks, FAQs)
-- -----------------------------------------------------------------------------
create table if not exists public.platform_settings (
  setting_key text primary key check (setting_key = 'global'),
  fx_rates jsonb not null,
  incoterm_deltas jsonb not null,
  regional_desks jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 12. Immutable System Audit Logs (Append-Only Administrative Transparency)
-- -----------------------------------------------------------------------------
create table if not exists public.system_audit_logs (
  id text primary key,
  category text not null check (category in ('pricing', 'catalog', 'rfq', 'market', 'documents', 'roles', 'settings', 'system')),
  action text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  target_type text not null,
  target_id text not null,
  target_label text not null,
  summary text not null,
  changes jsonb not null default '[]'::jsonb,
  actor_uid uuid not null references auth.users(id),
  actor_email text not null,
  actor_name text not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 13. Registered Buyer Corporate Profiles (Client Portal)
-- -----------------------------------------------------------------------------
create table if not exists public.buyer_profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  company_name text not null,
  contact_name text not null,
  phone text not null,
  country text not null,
  preferred_port text not null default '',
  tax_or_reg_id text not null default '',
  preferred_currency text not null default 'USD' check (preferred_currency in ('USD', 'EUR', 'AED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- Hardened SECURITY DEFINER RBAC Helper Functions (search_path locked)
-- =============================================================================

-- Returns the authenticated user's verified lowercase email from the Supabase JWT.
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

-- True iff the signed-in user is an active admin operator in public.admins.
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

-- True iff the signed-in user is an active admin with one of the specified base tiers.
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

-- True iff the signed-in user is an active superadmin OR holds a specific granular
-- permission boolean in public.admins.permissions (e.g. 'editProductsPricing').
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

-- =============================================================================
-- Immutability Triggers (Audit Log Tamper Protection & RFQ Identity Lock)
-- =============================================================================

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

-- Buyer-safe projection view (omits confidential internal desk_notes; inherits RLS)
create or replace view public.buyer_rfqs_portal
with (security_invoker = true)
as
select
  reference_id,
  product_slug,
  product_name,
  grade,
  quantity_mt,
  destination,
  incoterm,
  packaging,
  inspection,
  currency,
  estimated_unit_price,
  estimated_total,
  company_name,
  contact_name,
  email,
  phone,
  notes,
  status,
  buyer_uid,
  fulfillment_stage,
  vessel_name,
  bl_number,
  port_of_loading,
  eta_date,
  buyer_notice,
  created_at,
  updated_at
from public.rfq_inquiries;

grant select on public.buyer_rfqs_portal to authenticated;

-- =============================================================================
-- Enable Row-Level Security Across All 13 Tables
-- =============================================================================
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

-- =============================================================================
-- Granular Role-Based Row-Level Security Policies (Idempotent)
-- Regular users (anon + authenticated non-admins) are strictly READ-ONLY on
-- catalog, pricing, benchmarks, corridors, templates, and platform settings.
-- Only authenticated admins with the matching granular permission may mutate.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE 1: public.products (Catalog & Live FOB Pricing)
-- -----------------------------------------------------------------------------
drop policy if exists "Public read products" on public.products;
drop policy if exists "Editor manage products" on public.products;
drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_insert_pricing_admin" on public.products;
drop policy if exists "products_update_pricing_admin" on public.products;
drop policy if exists "products_delete_admin" on public.products;

create policy "products_select_public"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products_insert_pricing_admin"
  on public.products
  for insert
  to authenticated
  with check (
    public.has_admin_permission('editProductsPricing')
    and fob_usd_mt > 0
    and moq_mt > 0
  );

create policy "products_update_pricing_admin"
  on public.products
  for update
  to authenticated
  using (public.has_admin_permission('editProductsPricing'))
  with check (
    public.has_admin_permission('editProductsPricing')
    and fob_usd_mt > 0
    and moq_mt > 0
  );

create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 2: public.historical_prices (Historical FOB Benchmark Series)
-- -----------------------------------------------------------------------------
drop policy if exists "Public read historical prices" on public.historical_prices;
drop policy if exists "Editor manage prices" on public.historical_prices;
drop policy if exists "historical_prices_select_public" on public.historical_prices;
drop policy if exists "historical_prices_insert_admin" on public.historical_prices;
drop policy if exists "historical_prices_update_admin" on public.historical_prices;
drop policy if exists "historical_prices_delete_admin" on public.historical_prices;

create policy "historical_prices_select_public"
  on public.historical_prices
  for select
  to anon, authenticated
  using (true);

create policy "historical_prices_insert_admin"
  on public.historical_prices
  for insert
  to authenticated
  with check (
    public.has_admin_permission('editMarket')
    or public.has_admin_permission('editProductsPricing')
  );

create policy "historical_prices_update_admin"
  on public.historical_prices
  for update
  to authenticated
  using (
    public.has_admin_permission('editMarket')
    or public.has_admin_permission('editProductsPricing')
  )
  with check (
    public.has_admin_permission('editMarket')
    or public.has_admin_permission('editProductsPricing')
  );

create policy "historical_prices_delete_admin"
  on public.historical_prices
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 3: public.platform_settings (FX Rates, Incoterm Deltas, Desks, FAQs)
-- -----------------------------------------------------------------------------
drop policy if exists "Public read settings" on public.platform_settings;
drop policy if exists "Superadmin manage settings" on public.platform_settings;
drop policy if exists "platform_settings_select_public" on public.platform_settings;
drop policy if exists "platform_settings_insert_admin" on public.platform_settings;
drop policy if exists "platform_settings_update_admin" on public.platform_settings;

create policy "platform_settings_select_public"
  on public.platform_settings
  for select
  to anon, authenticated
  using (setting_key = 'global');

create policy "platform_settings_insert_admin"
  on public.platform_settings
  for insert
  to authenticated
  with check (
    setting_key = 'global'
    and public.has_admin_permission('editSettings')
  );

create policy "platform_settings_update_admin"
  on public.platform_settings
  for update
  to authenticated
  using (
    setting_key = 'global'
    and public.has_admin_permission('editSettings')
  )
  with check (
    setting_key = 'global'
    and public.has_admin_permission('editSettings')
  );
-- No DELETE policy on platform_settings (global settings row cannot be deleted).

-- -----------------------------------------------------------------------------
-- TABLE 4: public.market_insights (Published Read-Only for Public; Drafts Admin)
-- -----------------------------------------------------------------------------
drop policy if exists "Public read published insights" on public.market_insights;
drop policy if exists "Editor manage insights" on public.market_insights;
drop policy if exists "market_insights_select_published_or_admin" on public.market_insights;
drop policy if exists "market_insights_insert_admin" on public.market_insights;
drop policy if exists "market_insights_update_admin" on public.market_insights;
drop policy if exists "market_insights_delete_admin" on public.market_insights;

create policy "market_insights_select_published_or_admin"
  on public.market_insights
  for select
  to anon, authenticated
  using (
    published = true
    or public.has_admin_permission('viewMarket')
  );

create policy "market_insights_insert_admin"
  on public.market_insights
  for insert
  to authenticated
  with check (public.has_admin_permission('editMarket'));

create policy "market_insights_update_admin"
  on public.market_insights
  for update
  to authenticated
  using (public.has_admin_permission('editMarket'))
  with check (public.has_admin_permission('editMarket'));

create policy "market_insights_delete_admin"
  on public.market_insights
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 5: public.trade_corridors (Read-Only for Public; Admin Managed)
-- -----------------------------------------------------------------------------
drop policy if exists "Public read corridors" on public.trade_corridors;
drop policy if exists "Editor manage corridors" on public.trade_corridors;
drop policy if exists "trade_corridors_select_public" on public.trade_corridors;
drop policy if exists "trade_corridors_insert_admin" on public.trade_corridors;
drop policy if exists "trade_corridors_update_admin" on public.trade_corridors;
drop policy if exists "trade_corridors_delete_admin" on public.trade_corridors;

create policy "trade_corridors_select_public"
  on public.trade_corridors
  for select
  to anon, authenticated
  using (true);

create policy "trade_corridors_insert_admin"
  on public.trade_corridors
  for insert
  to authenticated
  with check (public.has_admin_permission('editMarket'));

create policy "trade_corridors_update_admin"
  on public.trade_corridors
  for update
  to authenticated
  using (public.has_admin_permission('editMarket'))
  with check (public.has_admin_permission('editMarket'));

create policy "trade_corridors_delete_admin"
  on public.trade_corridors
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 6: public.document_templates (Read-Only for Public; Doc Admin Managed)
-- -----------------------------------------------------------------------------
drop policy if exists "Public read doc templates" on public.document_templates;
drop policy if exists "Superadmin manage doc templates" on public.document_templates;
drop policy if exists "document_templates_select_public" on public.document_templates;
drop policy if exists "document_templates_insert_admin" on public.document_templates;
drop policy if exists "document_templates_update_admin" on public.document_templates;
drop policy if exists "document_templates_delete_admin" on public.document_templates;

create policy "document_templates_select_public"
  on public.document_templates
  for select
  to anon, authenticated
  using (true);

create policy "document_templates_insert_admin"
  on public.document_templates
  for insert
  to authenticated
  with check (public.has_admin_permission('manageDocuments'));

create policy "document_templates_update_admin"
  on public.document_templates
  for update
  to authenticated
  using (public.has_admin_permission('manageDocuments'))
  with check (public.has_admin_permission('manageDocuments'));

create policy "document_templates_delete_admin"
  on public.document_templates
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 7: public.rfq_inquiries (Public Validated Create, Buyer Self-Read, Admin Manage)
-- -----------------------------------------------------------------------------
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
  on public.rfq_inquiries
  for insert
  to anon, authenticated
  with check (
    status = 'received'
    and desk_notes = ''
    and fulfillment_stage is null
    and vessel_name is null
    and bl_number is null
    and port_of_loading is null
    and eta_date is null
    and buyer_notice is null
    and (
      buyer_uid is null
      or (
        buyer_uid = auth.uid()
        and lower(email) = public.auth_verified_email()
      )
    )
  );

create policy "rfq_inquiries_select_owner_or_admin"
  on public.rfq_inquiries
  for select
  to authenticated
  using (
    public.has_admin_permission('viewRfqs')
    or buyer_uid = auth.uid()
    or (
      public.auth_verified_email() is not null
      and lower(email) = public.auth_verified_email()
    )
  );

create policy "rfq_inquiries_update_admin"
  on public.rfq_inquiries
  for update
  to authenticated
  using (public.has_admin_permission('manageRfqs'))
  with check (public.has_admin_permission('manageRfqs'));

create policy "rfq_inquiries_delete_admin"
  on public.rfq_inquiries
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 8: public.buyer_profiles (Strict Owner Isolation + Admin RFQ View)
-- -----------------------------------------------------------------------------
drop policy if exists "Buyer manage own profile" on public.buyer_profiles;
drop policy if exists "Admin read buyer profiles" on public.buyer_profiles;
drop policy if exists "buyer_profiles_select_owner_or_admin" on public.buyer_profiles;
drop policy if exists "buyer_profiles_insert_owner" on public.buyer_profiles;
drop policy if exists "buyer_profiles_update_owner" on public.buyer_profiles;
drop policy if exists "buyer_profiles_delete_admin" on public.buyer_profiles;

create policy "buyer_profiles_select_owner_or_admin"
  on public.buyer_profiles
  for select
  to authenticated
  using (
    auth.uid() = uid
    or public.has_admin_permission('viewRfqs')
  );

create policy "buyer_profiles_insert_owner"
  on public.buyer_profiles
  for insert
  to authenticated
  with check (
    auth.uid() = uid
    and public.auth_verified_email() is not null
    and lower(email) = public.auth_verified_email()
  );

create policy "buyer_profiles_update_owner"
  on public.buyer_profiles
  for update
  to authenticated
  using (auth.uid() = uid)
  with check (
    auth.uid() = uid
    and public.auth_verified_email() is not null
    and lower(email) = public.auth_verified_email()
  );

create policy "buyer_profiles_delete_admin"
  on public.buyer_profiles
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 9: public.document_access_logs (PII Protected Vault Logs)
-- -----------------------------------------------------------------------------
drop policy if exists "Public verify document vault" on public.document_access_logs;
drop policy if exists "Superadmin manage vault logs" on public.document_access_logs;
drop policy if exists "Superadmin revoke vault logs" on public.document_access_logs;
drop policy if exists "doc_access_logs_insert_public" on public.document_access_logs;
drop policy if exists "doc_access_logs_select_admin" on public.document_access_logs;
drop policy if exists "doc_access_logs_update_admin" on public.document_access_logs;
drop policy if exists "doc_access_logs_delete_admin" on public.document_access_logs;

create policy "doc_access_logs_insert_public"
  on public.document_access_logs
  for insert
  to anon, authenticated
  with check (status = 'active');

create policy "doc_access_logs_select_admin"
  on public.document_access_logs
  for select
  to authenticated
  using (public.has_admin_permission('viewDocuments'));

create policy "doc_access_logs_update_admin"
  on public.document_access_logs
  for update
  to authenticated
  using (public.has_admin_permission('manageDocuments'))
  with check (public.has_admin_permission('manageDocuments'));

create policy "doc_access_logs_delete_admin"
  on public.document_access_logs
  for delete
  to authenticated
  using (public.has_admin_permission('deleteRecords'));

-- -----------------------------------------------------------------------------
-- TABLE 10: public.vault_revocations (Non-PII Revocation Check)
-- -----------------------------------------------------------------------------
drop policy if exists "Public check vault revocations" on public.vault_revocations;
drop policy if exists "Superadmin manage vault revocations" on public.vault_revocations;
drop policy if exists "vault_revocations_select_public" on public.vault_revocations;
drop policy if exists "vault_revocations_insert_admin" on public.vault_revocations;
drop policy if exists "vault_revocations_update_admin" on public.vault_revocations;
drop policy if exists "vault_revocations_delete_admin" on public.vault_revocations;

create policy "vault_revocations_select_public"
  on public.vault_revocations
  for select
  to anon, authenticated
  using (true);

create policy "vault_revocations_insert_admin"
  on public.vault_revocations
  for insert
  to authenticated
  with check (public.has_admin_permission('manageDocuments'));

create policy "vault_revocations_update_admin"
  on public.vault_revocations
  for update
  to authenticated
  using (public.has_admin_permission('manageDocuments'))
  with check (public.has_admin_permission('manageDocuments'));

create policy "vault_revocations_delete_admin"
  on public.vault_revocations
  for delete
  to authenticated
  using (public.has_admin_permission('manageDocuments'));

-- -----------------------------------------------------------------------------
-- TABLE 11: public.role_definitions (RBAC Permission Templates)
-- -----------------------------------------------------------------------------
drop policy if exists "Admin read role definitions" on public.role_definitions;
drop policy if exists "Superadmin manage role definitions" on public.role_definitions;
drop policy if exists "role_definitions_select_admin" on public.role_definitions;
drop policy if exists "role_definitions_insert_superadmin" on public.role_definitions;
drop policy if exists "role_definitions_update_superadmin" on public.role_definitions;
drop policy if exists "role_definitions_delete_custom_superadmin" on public.role_definitions;

create policy "role_definitions_select_admin"
  on public.role_definitions
  for select
  to authenticated
  using (public.is_active_admin());

create policy "role_definitions_insert_superadmin"
  on public.role_definitions
  for insert
  to authenticated
  with check (
    public.has_admin_permission('manageRoles')
    and (is_system = false or id = 'superadmin')
  );

create policy "role_definitions_update_superadmin"
  on public.role_definitions
  for update
  to authenticated
  using (public.has_admin_permission('manageRoles'))
  with check (public.has_admin_permission('manageRoles'));

create policy "role_definitions_delete_custom_superadmin"
  on public.role_definitions
  for delete
  to authenticated
  using (
    public.has_admin_permission('manageRoles')
    and is_system = false
  );

-- -----------------------------------------------------------------------------
-- TABLE 12: public.admins (Strict Anti-Privilege-Escalation RBAC Directory)
-- Regular operators can ONLY read their own row; only manageRoles admins can
-- insert, update, or delete operator assignments (with anti-self-lockout).
-- -----------------------------------------------------------------------------
drop policy if exists "Superadmin manage admins" on public.admins;
drop policy if exists "admins_select_self_or_manager" on public.admins;
drop policy if exists "admins_insert_manager" on public.admins;
drop policy if exists "admins_update_manager" on public.admins;
drop policy if exists "admins_delete_manager" on public.admins;

create policy "admins_select_self_or_manager"
  on public.admins
  for select
  to authenticated
  using (
    auth.uid() = uid
    or public.has_admin_permission('manageRoles')
  );

create policy "admins_insert_manager"
  on public.admins
  for insert
  to authenticated
  with check (public.has_admin_permission('manageRoles'));

create policy "admins_update_manager"
  on public.admins
  for update
  to authenticated
  using (public.has_admin_permission('manageRoles'))
  with check (
    public.has_admin_permission('manageRoles')
    and (
      uid <> auth.uid()
      or (
        status = 'active'
        and (
          role = 'superadmin'
          or coalesce((permissions ->> 'manageRoles')::boolean, false) = true
        )
      )
    )
  );

create policy "admins_delete_manager"
  on public.admins
  for delete
  to authenticated
  using (
    public.has_admin_permission('manageRoles')
    and uid <> auth.uid()
  );

-- -----------------------------------------------------------------------------
-- TABLE 13: public.system_audit_logs (Immutable Append-Only Audit Stream)
-- -----------------------------------------------------------------------------
drop policy if exists "Admin read system audit logs" on public.system_audit_logs;
drop policy if exists "Active admin append system audit logs" on public.system_audit_logs;
drop policy if exists "system_audit_logs_select_admin" on public.system_audit_logs;
drop policy if exists "system_audit_logs_insert_active_admin" on public.system_audit_logs;

create policy "system_audit_logs_select_admin"
  on public.system_audit_logs
  for select
  to authenticated
  using (
    public.has_admin_permission('manageRoles')
    or public.has_admin_permission('viewOverview')
  );

create policy "system_audit_logs_insert_active_admin"
  on public.system_audit_logs
  for insert
  to authenticated
  with check (
    public.is_active_admin()
    and actor_uid = auth.uid()
    and public.auth_verified_email() is not null
    and lower(actor_email) = public.auth_verified_email()
  );
-- No UPDATE or DELETE policies + BEFORE UPDATE OR DELETE trigger enforces immutability.
