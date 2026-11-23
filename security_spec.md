# PetroTechnics Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default-Deny Safety Net**: Any unmatched path under `/databases/{database}/documents` is unconditionally denied.
2. **Granular RBAC Non-Escalation**:
   - Only verified superadmins (`request.auth.token.email == 'ghaderi.sabir@gmail.com' && request.auth.token.email_verified == true` or active `admins/{uid}` with `role == 'superadmin'` or `permissions.manageRoles == true`) can create, edit, or delete `/role_definitions/{roleId}` and `/admins/{uid}`.
   - Built-in system roles (`isSystem == true`, e.g. `superadmin`) cannot be deleted or have `isSystem` mutated.
   - Operators can never delete their own `admins/{uid}` document or self-assign/escalate their own permissions.
   - Every `admins/{uid}` document creation/update validates that `roleId` exists in `/role_definitions/{roleId}` (`existsAfter`), and stores an exact 12-key boolean `permissions` map verified by `isValidPermissionsMap()`.
3. **Granular Permission Enforcement**:
   - `products`: write requires `editProductsPricing`; delete requires `deleteRecords`.
   - `rfq_inquiries`: `get` requires `viewRfqs`; status/desk-note updates require `manageRfqs`; delete requires `deleteRecords`.
   - `market_insights`, `historical_prices`, `trade_corridors`: write requires `editMarket`; delete requires `deleteRecords`.
   - `document_templates`, `document_access_logs`, `vault_revocations`: read requires `viewDocuments`; template edits and vault revocations require `manageDocuments`.
   - `platform_settings/global`: updates require `editSettings`.
   - `role_definitions` & `admins`: mutations require `manageRoles`.
4. **PII Isolation & Buyer Self-Scoping (Split Collection + Pillar 8)**:
   - `/rfq_inquiries/{rfqId}` contains buyer PII (`email`, `phone`, `contactName`, `companyName`). Public buyers may only `create` with `status == 'received'`, `deskNotes == ''`, no admin fulfillment fields, and server timestamps. Verified signed-in buyers may `get`/`list` ONLY documents where `resource.data.email == request.auth.token.email.lower()`; admins with `viewRfqs`/`manageRfqs` manage pipeline status and shipment fulfillment milestones.
   - `/buyer_profiles/{uid}` stores registered buyer corporate details for the Client Portal. Read/create/update is strictly locked to the verified owner (`request.auth.uid == uid` and immutable `email == request.auth.token.email.lower()`), with admin read gated by `viewRfqs`.
   - `/document_access_logs/{tokenId}` contains buyer PII (`company`, `email`). Token revocation status is mirrored into non-PII `/vault_revocations/{tokenId}` for single-doc `get` verification.
5. **Validation Blueprints & Temporal Integrity**: Every `create` and `update` invokes a standalone `isValid<Entity>(incoming())` helper enforcing strict key allowlists (`hasAll` + `hasOnly`), type & `.size()` limits on every string and array, `isValidId()` regex on document IDs, immutable `createdAt`, and server-timestamp enforcement (`request.time`).
6. **Immutable System Audit Trail (`/system_audit_logs/{logId}`)**:
   - Only verified active operators can `create` audit entries, and `actorUid` MUST equal `request.auth.uid`, `actorEmail` MUST equal `request.auth.token.email.lower()`, and `createdAt` MUST equal `request.time`.
   - `update` and `delete` are unconditionally denied (`if false`) for all users including superadmins to guarantee forensic tamper-evidence.
7. **Zero-Cost List Queries (Pillar 8)**: No `allow list` block calls `get()` or `exists()`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Self-Assigned Superadmin Creation**: Non-admin user attempts `create` on `/admins/{ownUid}` with `role: "superadmin"` and `permissions.manageRoles: true`.
2. **Unverified Admin Email Spoof**: Request with `email: "ghaderi.sabir@gmail.com"` and `email_verified: false` attempts `update` on `/platform_settings/global`.
3. **Cross-Buyer RFQ Scraping**: Verified buyer A (`buyerA@corp.com`) attempts `get` or `list` on `/rfq_inquiries` belonging to `buyerB@corp.com`.
4. **Buyer Order Stage Forgery**: Buyer attempts `create` on `/rfq_inquiries/{id}` injecting `fulfillmentStage: "delivered"` or `status: "contracted"`, or attempts `update` on their own RFQ to self-approve status.
5. **Buyer Profile Identity Spoofing**: Buyer A attempts `create` or `read` on `/buyer_profiles/{buyerB_uid}`, or attempts `update` changing their `email` or `uid` field.
6. **Read-Only Analyst Price Mutation**: Active `Read-Only Analyst` (`editProductsPricing: false`) attempts `update` on `/products/urea-46` setting `fobUsdMt: 1`.
7. **Sales Lead Settings Escalation**: Active `Sales Lead` (`editSettings: false`) attempts `update` on `/platform_settings/global`.
8. **Audit Log Tampering / Erasure**: Superadmin attempts `update` or `delete` on `/system_audit_logs/{logId}` to alter or erase historical audit records.
9. **Audit Actor Spoofing**: Operator attempts `create` on `/system_audit_logs/{logId}` with `actorUid` or `actorEmail` belonging to another admin.
10. **Client Timestamp Tampering**: Buyer creates RFQ/BuyerProfile or Admin creates AuditLog / RoleDefinition with client-forged `createdAt` not equal to `request.time`.
11. **Document Access Log & Audit Log PII Scraping**: Non-admin attempts `list` or `get` on `/document_access_logs` or `/system_audit_logs`.
12. **Draft Insight Leakage / Value Poisoning**: Public client attempts `list` on `/market_insights` without `published == true`, or attempts invalid type update on `/historical_prices/2026-11`.
