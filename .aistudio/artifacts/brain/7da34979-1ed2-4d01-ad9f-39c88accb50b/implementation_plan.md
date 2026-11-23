# PetroTechnics Superadmin Dashboard & Full Real-Data Backend Architecture

An institutional Superadmin Console and full-stack relational PostgreSQL migration that connects every public storefront view, interactive chart, D3 corridor map, Document Hub, and RFQ desk directly to live backend APIs—eliminating all hardcoded mock data across the platform.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Phase 1 Decisions & Database / Deployment Strategy**
>
> - **Confirmed Scope (All 5 Modules)**: Real-time management of (1) Products catalog, grades & live FOB pricing, (2) RFQ pipeline & quote status workflow, (3) Market insights, historical price series & trade corridors, (4) Document Hub templates & buyer vault audit logs, and (5) Admin roles, live FX rates & regional commercial desks.
> - **Confirmed Initialization**: One-time idempotent database seed of the PetroTechnics catalog, 7 trade corridors, 12-month benchmark price history, 6 trade document templates, FX rates, and regional desks—every record is immediately editable or deletable from the Superadmin Console.
> - **Confirmed Entry Point**: Dedicated full-screen Superadmin Console reached via a subtle **Admin Console** sign-in link in the Footer (keeping the public buyer navigation bar completely focused on trade inquiries).
> - **PostgreSQL Runtime (AI Studio Preview + Vercel / Supabase Parity)**: Because AI Studio natively provisions a hosted **PostgreSQL** database (Cloud SQL for PostgreSQL with Drizzle ORM + Google Sign-In via Firebase Auth), we will provision and run against a real PostgreSQL instance in live preview immediately upon approval. Because both Cloud SQL and **Supabase** run standard PostgreSQL, the exact same Drizzle relational schema and API routes are 100% PostgreSQL-compatible—and we will include a **Vercel serverless adapter configuration** plus an exportable **Supabase SQL migration & Row-Level Security (RLS) script** so you can deploy straight to Vercel + Supabase with zero schema rewrites.

> [!NOTE]
> **Initial Superadmin Bootstrap**: Upon first sign-in, your Google account (`ghaderi.sabir@gmail.com`) will automatically be provisioned with the `superadmin` role in PostgreSQL so you immediately have full administrative access to manage other team roles (`superadmin`, `editor`, `desk_agent`).

---

## 1. Overview & Core Concept

- **What It Does**: Replaces every static/in-memory dataset across PetroTechnics with a unified PostgreSQL-backed REST API and adds a dedicated, authenticated **Superadmin Operations Console**. Every edit made by the superadmin—updating Urea FOB pricing, adjusting EUR/AED exchange rates, advancing an RFQ from *Received* to *Quoted*, publishing a Market Insight, editing a monthly price benchmark point, or revoking a Document Hub buyer session—reflects live across the public buyer storefront on the next fetch.
- **Target Audience / Persona**:
  - **Superadmin / Managing Director**: Full platform authority over commercial pricing, FX conversion basis, RFQ deal desk pipeline, editorial publishing, corridor schedules, document templates, and team role permissions.
  - **Commercial Desk & Editors (RBAC)**: Role-scoped internal operators managed inside the Superadmin Console.
  - **Global Petrochemical Buyers**: Experience a 100% live platform with real pricing, persistent RFQs, verified document downloads, and Gemini search-grounded daily market intelligence.
- **Key Value**: Transforms PetroTechnics from a static trading showcase into a live, database-driven B2B petrochemical operations platform with zero mock data and institutional governance.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Public Storefront (Zero-Mock Live Hydration)**:
   - Every view loads its live data from PostgreSQL via the Express API, displaying clean geometric loading skeletons during fetch, informative empty states when a collection has no records, and retryable error banners if an API request fails.
   - Currency conversions (`USD`, `EUR`, `AED`) pull live FX rates and Incoterms freight allowances directly from PostgreSQL `platform_settings`.
   - The Recharts **Historical Price Trends** chart reads real monthly records from PostgreSQL `historical_prices`, and the D3.js **Global Trade Corridors** map renders live routes from PostgreSQL `trade_corridors`.
2. **Superadmin Sign-In & Role Gate**:
   - Clicking **Admin Console** in the Footer (or navigating to `/admin`) opens a crisp, centered corporate sign-in gate authenticated via Google Sign-In.
   - The backend verifies the cryptographic ID token on every admin API call and checks the user's `role` column in PostgreSQL (`superadmin` required for role/settings/template mutations; unauthorized accounts receive an explicit *Access Restricted* screen with a sign-out button).
3. **Full-Screen Superadmin Workspace**:
   - **Overview Command**: Live KPI strip computed directly from PostgreSQL aggregates (active catalog lines, open RFQs, estimated pipeline value, verified vault clearances, published insights) plus recent RFQ activity and quick-create actions.
   - **Catalog & Live FOB Pricing**: Searchable, filterable high-density table of all petrochemical lines with inline FOB USD/MT quick-price editing, full slide-over editor for trilingual names/summaries, CAS/HS codes, MOQ, grades, ASTM specs, packaging, and create/delete controls.
   - **RFQ Deal Desk Pipeline**: Filterable status tabs (*All*, *Received*, *Reviewing*, *Quoted*, *Contracted*, *Archived*), inspection drawer showing full buyer specs and currency valuation, status transition selector, internal desk notes, and CSV/receipt export.
   - **Market Intelligence, Price Trends & Corridors**: Three clean sub-tabs managing (a) trilingual Market Insight articles (create/edit/publish/unpublish/delete), (b) monthly `historical_prices` table feeding the Recharts chart, and (c) `trade_corridors` transit times, ports, and commodity allocations feeding the D3 map.
   - **Document Hub & Vault Audit**: Edit commercial clauses/metadata/revisions for the 6 trade templates (`PI`, `B/L`, `SGS`, `FCO`, `COO`, `COA`) and audit live buyer verification sessions with one-click **Revoke Access** enforcement (revoked tokens can no longer download watermarked templates).
   - **Roles, FX Rates & Regional Desks**: Update live `USD`/`EUR`/`AED` conversion rates & Incoterms freight allowances, edit regional commercial desk contact info, manage FAQs, and promote/demote or disable team user roles.

### Visual Identity & Theme (SaaS Operations Console Rules)

- **Aesthetic Direction**: High-precision institutional commodity operations console—matching PetroTechnics' crisp architectural light canvas with a dark deep-petrol command sidebar for clear visual separation from the public storefront.
- **Workspace Layout**:
  - Fixed `260px` deep-petrol sidebar (`#061E29`) with 6 module links, live pending-RFQ counter, and **Return to Public Site** exit action (collapsible drawer on mobile).
  - Contextual `64px` top bar with breadcrumb trail (`PetroTechnics Console / [Active Module]`) on the start edge and at most 1–2 single-line primary actions on the end edge (`whitespace-nowrap shrink-0`).
  - Single-elevation flat surfaces (`#FFFFFF` panels on `#F7F9FB` canvas separated by `1px solid #E5EBF0` hairline dividers—zero nested card sandwiches, zero thick left borders).
- **Color Palette & Semantic States**:
  - Neutral Canvas (`#F7F9FB` / `#FFFFFF`, 60%), Structural Surfaces (`#061E29` sidebar, `#E5EBF0` hairlines, `#4A5B6C` prose, 30%), Deep Petrol Accent (`#0E4D64`, 10%).
  - Semantic status signaling strictly paired with explicit icon + text label (never hue alone, no pulsing decorative dots): Nominal/Quoted (`#16A34A`), Reviewing/Pending (`#D97706`), Revoked/Archived (`#DC2626`).
- **Typography & High-Density Grids**:
  - `Outfit` for module headings and sidebar navigation, `DM Sans` for compact 13px–14px workspace prose, `JetBrains Mono` with `tabular-nums` for every FOB price, FX rate, tonnage, HS code, reference ID, and UTC timestamp (`Vazirmatn` preserved in RTL Persian/Arabic modes).
  - Compact `40px` table row heights with right-aligned numeric columns and subtle `#F7F9FB` row hover states.
- **Interactive Feedback & Motion**:
  - Sub-200ms slide-over drawer transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), inline save confirmations, confirmation modals before destructive deletes/revocations, geometric skeleton rows during database queries, and explicit empty/error states on every module.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified PostgreSQL + Drizzle ORM with Vercel & Supabase Portability**
  - *Chosen Approach*: Provision a live PostgreSQL instance in AI Studio via Drizzle ORM (`node-postgres` pool) for immediate real-database operation, paired with a Vercel serverless API entrypoint and an exportable Supabase SQL + RLS migration pack.
  - *Why*: Eliminates mock data and JSON flat-file storage immediately in the live preview while keeping 100% PostgreSQL SQL compatibility for your Vercel + Supabase deployment.
  - *Alternatives Considered*: Wiring raw client-side Supabase keys without a live database would leave the preview non-functional until external keys are manually provisioned; using local JSON files would not scale to serverless Vercel functions.
- **Decision 2: Strict Backend Authorization & Token Verification**
  - *Chosen Approach*: Every `/api/admin/*` route validates a short-lived Bearer ID token server-side and verifies the user's PostgreSQL `role === 'superadmin'` (or authorized editor role) before executing any mutation or returning PII/audit logs.
  - *Why*: Ensures buyer RFQ contact details, vault clearance tokens, and pricing mutations can never be accessed or altered from an unauthenticated client.
- **Decision 3: Zero-Mock Policy with Idempotent Initial Seeding**
  - *Chosen Approach*: Remove all client-side fallback catalog/corridor/price/template arrays from React views. Provide a one-time idempotent database seeder that populates PostgreSQL only when tables are empty on first boot, plus an explicit *"Reset Demo Seed"* safeguard excluded from production mutations.
  - *Why*: Guarantees that every number, price, chart point, and document rendered in the UI genuinely originates from PostgreSQL—and deleting an item in Superadmin genuinely removes it everywhere.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### System & Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       React SPA (Vite + Tailwind v4)                    │
│                                                                         │
│  ┌───────────────────────────────────┐  ┌─────────────────────────────┐ │
│  │  Public Storefront (Trilingual)   │  │  Superadmin Console (/admin)│ │
│  │  Home · Catalog · Detail · RFQ    │  │  Google Auth Gate + RBAC    │ │
│  │  Markets (D3) · Insights (Rech.)  │  │  ┌───────────────────────┐  │ │
│  │  Trade Process & Document Hub     │  │  │ 260px Petrol Sidebar  │  │ │
│  │  Global Search · USD/EUR/AED      │  │  │ Overview · Catalog    │  │ │
│  │  (Zero hardcoded mock arrays)     │  │  │ RFQs · Market/Routes  │  │ │
│  └────────────────┬──────────────────┘  │  │ Docs/Audit · Settings │  │ │
│                   │                     │  └───────────┬───────────┘  │ │
│                   │ Public GET / POST   │              │ Bearer Token │ │
└───────────────────┼─────────────────────┴──────────────┼──────────────┘
                    ▼                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│             Express REST API (Dev Server + Vercel Serverless)           │
│                                                                         │
│  Public Routes:                     Admin RBAC Routes (Auth Middleware):│
│  • /api/bootstrap (settings/FX)     • /api/admin/overview               │
│  • /api/products & /:slug           • /api/admin/products (CRUD + FOB)  │
│  • /api/corridors                   • /api/admin/rfqs (List/Patch/Del)  │
│  • /api/insights & /price-history   • /api/admin/insights & /prices     │
│  • /api/documents & /verify & /dl   • /api/admin/corridors (CRUD)       │
│  • /api/rfq (POST buyer inquiry)    • /api/admin/documents & /logs      │
│  • /api/market-intelligence (Gemini)• /api/admin/settings & /users      │
└───────────────────┬────────────────────────────────────┬────────────────┘
                    │ Drizzle ORM (node-postgres Pool)   │ Server-Side
                    ▼                                    ▼
┌──────────────────────────────────────┐   ┌──────────────────────────────┐
│  PostgreSQL Database                 │   │  External Services           │
│  • Live Preview: Cloud SQL Postgres  │   │  • Firebase Auth (ID Tokens) │
│  • Prod Target: Supabase Postgres    │   │  • Gemini API (Search News)  │
│    (+ Exportable SQL & RLS Script)   │   └──────────────────────────────┘
└──────────────────────────────────────┘
```

### Relational PostgreSQL Data Model

```
┌──────────────────┐      ┌────────────────────────┐      ┌─────────────────────┐
│ users            │      │ products               │      │ rfq_inquiries       │
├──────────────────┤      ├────────────────────────┤      ├─────────────────────┤
│ id (PK)          │      │ slug (PK)              │◄────┐│ id (PK)             │
│ uid (UNIQUE)     │      │ category               │     ││ reference_id (UNIQ) │
│ email            │      │ fob_usd_mt (NUMERIC)   │     └│ product_slug (FK)   │
│ display_name     │      │ moq_mt, hs_code, cas   │      │ grade, quantity_mt  │
│ role (ENUM)      │      │ localized JSONB fields │      │ incoterm, currency  │
│ status           │      │ grades/specs/ports     │      │ est_unit, est_total │
│ created_at       │      │ updated_at             │      │ buyer contact PII   │
└──────────────────┘      └────────────────────────┘      │ status, desk_notes  │
                                                          └─────────────────────┘

┌──────────────────┐      ┌────────────────────────┐      ┌─────────────────────┐
│ market_insights  │      │ historical_prices      │      │ trade_corridors     │
├──────────────────┤      ├────────────────────────┤      ├─────────────────────┤
│ slug (PK)        │      │ id (PK)                │      │ id (PK)             │
│ category, date   │      │ month_label, sort_ord  │      │ mode_code, transit  │
│ localized fields │      │ urea_usd, hdpe_usd     │      │ localized fields    │
│ sections (JSONB) │      │ pp_usd, methanol_usd   │      │ ports, commodities  │
│ is_published     │      │ updated_at             │      │ map coords (JSONB)  │
└──────────────────┘      └────────────────────────┘      └─────────────────────┘

┌──────────────────┐      ┌────────────────────────┐      ┌─────────────────────┐
│ document_templs  │      │ document_access_logs   │      │ platform_settings   │
├──────────────────┤      ├────────────────────────┤      ├─────────────────────┤
│ id (PK)          │      │ id (PK)                │      │ key (PK)            │
│ code, category   │      │ clearance_token (UNIQ) │      │ fx_rates (JSONB)    │
│ revision, sha256 │      │ company, email         │      │ incoterm_deltas     │
│ localized fields │      │ status (active/revoked)│      │ regional_desks      │
│ metadata/clauses │      │ verified_at, revoked_at│      │ faqs & testimonials │
└──────────────────┘      └────────────────────────┘      └─────────────────────┘
```

### Interactive Component & State Mapping

- **Public Bootstrap & Real-Time Sync**: A centralized client data hook fetches `/api/bootstrap` (FX rates, Incoterm deltas, regional desks, FAQs, trade steps) plus view-specific live collections (`/api/products`, `/api/corridors`, `/api/insights`, `/api/price-history`, `/api/documents`). Switching back from `/admin` to the public storefront automatically re-fetches updated records so superadmin edits appear immediately.
- **Document Hub Clearance Enforcement**: `POST /api/documents/verify` persists a row into `document_access_logs`; `GET /api/documents/:id/download` checks that the clearance token exists and has `status = 'active'` in PostgreSQL. If the superadmin clicks **Revoke** in the audit log table, subsequent downloads with that token are immediately blocked with HTTP `403`.
- **RFQ Pipeline State Machine**: Buyer submissions write to `rfq_inquiries` (`status = 'received'`). Inside the Superadmin RFQ drawer, changing status (`received` → `reviewing` → `quoted` → `contracted` → `archived`) or saving internal desk notes triggers `PATCH /api/admin/rfqs/:id`, updating both PostgreSQL and the live KPI summary counters.
- **Inline & Slide-Over CRUD Validation**: All Superadmin create/edit forms validate required fields, positive numeric prices/tonnages, valid currency rates, and non-empty localized titles before submitting, surfacing server-side error messages inline without losing unsaved edits.
- **Vercel + Supabase Deployment Kit**: Includes a `vercel.json` routing configuration, serverless Express handler wrapper, and an inspectable/downloadable **Supabase SQL + RLS Migration Pack** alongside the existing Rust Axum export modal so deploying to Vercel + Supabase is turnkey.
