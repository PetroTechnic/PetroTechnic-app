import { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Slash,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  AdminPermissions,
  AdminRole,
  AdminUser,
  PermissionKey,
  RoleDefinition,
} from '../../types/domain';
import {
  countEnabledPermissions,
  DEFAULT_ROLE_DEFINITIONS,
  deriveBaseTierFromPermissions,
  EMPTY_PERMISSIONS,
  FULL_PERMISSIONS,
  PERMISSION_MODULES,
} from '../../data/roles';
import {
  deleteAdminUser,
  deleteRoleDefinition,
  sanitizeDocId,
  saveRoleDefinitionAndSyncMembers,
  upsertAdminUser,
} from '../../lib/firestoreRepo';
import { formatFirestoreErrorMessage } from '../../lib/firebase';

interface AdminRolesPanelProps {
  roleDefinitions: RoleDefinition[];
  admins: AdminUser[];
  currentUid: string;
  canManageRoles: boolean;
  onInitializeDefaultRoles: () => Promise<void>;
  initializingRoles: boolean;
}

type RolesSubTab = 'members' | 'definitions';

function describeModuleAccess(
  perms: AdminPermissions,
  readKey: PermissionKey,
  writeKey?: PermissionKey,
): { label: string; tone: 'write' | 'read' | 'none' } {
  if (writeKey && perms[writeKey]) {
    return { label: 'Read & Edit', tone: 'write' };
  }
  if (perms[readKey]) {
    return { label: 'Read Only', tone: 'read' };
  }
  return { label: 'No Access', tone: 'none' };
}

function summarizeOperatorAccess(perms: AdminPermissions): string {
  const enabled = countEnabledPermissions(perms);
  if (enabled === 12) return 'Full Governance';
  const writes: string[] = [];
  if (perms.editProductsPricing) writes.push('Pricing');
  if (perms.manageRfqs) writes.push('RFQs');
  if (perms.editMarket) writes.push('Market');
  if (perms.manageDocuments) writes.push('Vault');
  if (perms.editSettings) writes.push('Settings');
  if (perms.manageRoles) writes.push('Roles');
  if (writes.length === 0) return 'Read-Only Access';
  return `Edit: ${writes.slice(0, 3).join(', ')}${writes.length > 3 ? ` +${writes.length - 3}` : ''}`;
}

export function AdminRolesPanel({
  roleDefinitions,
  admins,
  currentUid,
  canManageRoles,
  onInitializeDefaultRoles,
  initializingRoles,
}: AdminRolesPanelProps) {
  const [subTab, setSubTab] = useState<RolesSubTab>('members');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);
  const [confirmDeleteRoleId, setConfirmDeleteRoleId] = useState<string | null>(null);

  // Onboard Team Member Slide-Over Drawer
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [memberSaving, setMemberSaving] = useState(false);
  const [newMember, setNewMember] = useState({
    uid: '',
    email: '',
    displayName: '',
    roleId: 'read-only-analyst',
  });

  // Role Definition Slide-Over Drawer
  const [editingRole, setEditingRole] = useState<{
    id: string;
    name: string;
    description: string;
    baseTier: AdminRole;
    isSystem: boolean;
    permissions: AdminPermissions;
  } | null>(null);
  const [isNewRole, setIsNewRole] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);

  const flashSaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const roleMap = useMemo(() => {
    const map = new Map<string, RoleDefinition>();
    for (const r of roleDefinitions) map.set(r.id, r);
    return map;
  }, [roleDefinitions]);

  const memberCountByRoleId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const adm of admins) {
      counts[adm.roleId] = (counts[adm.roleId] ?? 0) + 1;
    }
    return counts;
  }, [admins]);

  const activeOperatorsCount = useMemo(
    () => admins.filter((a) => a.status === 'active').length,
    [admins],
  );

  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admins.filter((adm) => {
      if (roleFilter !== 'all' && adm.roleId !== roleFilter) return false;
      if (!q) return true;
      return (
        adm.displayName.toLowerCase().includes(q) ||
        adm.email.toLowerCase().includes(q) ||
        adm.uid.toLowerCase().includes(q) ||
        adm.roleName.toLowerCase().includes(q)
      );
    });
  }, [admins, search, roleFilter]);

  const handleCopyUid = (uid: string) => {
    void navigator.clipboard?.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid((cur) => (cur === uid ? null : cur)), 1600);
  };

  // --- Member Operations ---
  const openOnboardDrawer = () => {
    const defaultRoleId =
      roleDefinitions.find((r) => r.id === 'read-only-analyst')?.id ??
      roleDefinitions[0]?.id ??
      'read-only-analyst';
    setNewMember({
      uid: '',
      email: '',
      displayName: '',
      roleId: defaultRoleId,
    });
    setErrorMsg(null);
    setMemberDrawerOpen(true);
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const uid = newMember.uid.trim();
    const email = newMember.email.trim().toLowerCase();
    if (!uid || !email) {
      setErrorMsg('Firebase Auth UID and corporate email address are required.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(uid)) {
      setErrorMsg('Firebase Auth UID may only contain letters, numbers, hyphens, and underscores.');
      return;
    }
    const assignedRole = roleMap.get(newMember.roleId);
    if (!assignedRole) {
      setErrorMsg('Select a valid Role Definition before onboarding.');
      return;
    }

    setMemberSaving(true);
    try {
      const existingAdmin = admins.find((a) => a.uid === uid) ?? null;
      await upsertAdminUser(
        {
          uid,
          email,
          displayName: newMember.displayName.trim() || email.split('@')[0],
          role: assignedRole.baseTier,
          roleId: assignedRole.id,
          roleName: assignedRole.name,
          permissions: { ...assignedRole.permissions },
          status: 'active',
        },
        Boolean(existingAdmin),
        existingAdmin,
      );
      setMemberDrawerOpen(false);
      flashSaved(`Assigned ${email} to ${assignedRole.name}.`);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setMemberSaving(false);
    }
  };

  const handleReassignRole = async (adm: AdminUser, nextRoleId: string) => {
    const targetRole = roleMap.get(nextRoleId);
    if (!targetRole) return;
    setBusyUid(adm.uid);
    setErrorMsg(null);
    try {
      await upsertAdminUser(
        {
          uid: adm.uid,
          email: adm.email,
          displayName: adm.displayName,
          role: targetRole.baseTier,
          roleId: targetRole.id,
          roleName: targetRole.name,
          permissions: { ...targetRole.permissions },
          status: adm.status,
        },
        true,
        adm,
      );
      flashSaved(`Updated ${adm.displayName} to ${targetRole.name}.`);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setBusyUid(null);
    }
  };

  const handleToggleMemberStatus = async (adm: AdminUser) => {
    setBusyUid(adm.uid);
    setErrorMsg(null);
    const nextStatus = adm.status === 'active' ? 'disabled' : 'active';
    const currentRole = roleMap.get(adm.roleId);
    try {
      await upsertAdminUser(
        {
          uid: adm.uid,
          email: adm.email,
          displayName: adm.displayName,
          role: currentRole?.baseTier ?? adm.role,
          roleId: currentRole?.id ?? adm.roleId,
          roleName: currentRole?.name ?? adm.roleName,
          permissions: currentRole
            ? { ...currentRole.permissions }
            : { ...adm.permissions },
          status: nextStatus,
        },
        true,
        adm,
      );
      flashSaved(
        nextStatus === 'active'
          ? `Re-activated console access for ${adm.email}.`
          : `Suspended console access for ${adm.email}.`,
      );
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setBusyUid(null);
    }
  };

  const handleDeleteMember = async (uid: string) => {
    setErrorMsg(null);
    const target = admins.find((a) => a.uid === uid);
    try {
      await deleteAdminUser(
        uid,
        target ? `${target.displayName} (${target.email})` : undefined,
      );
      setConfirmDeleteUid(null);
      flashSaved('Removed operator from RBAC directory.');
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  // --- Role Definition Operations ---
  const openCreateRoleDrawer = () => {
    setIsNewRole(true);
    setEditingRole({
      id: '',
      name: '',
      description: '',
      baseTier: 'analyst',
      isSystem: false,
      permissions: {
        ...EMPTY_PERMISSIONS,
        viewOverview: true,
        viewProducts: true,
      },
    });
    setErrorMsg(null);
  };

  const openEditRoleDrawer = (role: RoleDefinition) => {
    setIsNewRole(false);
    setEditingRole({
      id: role.id,
      name: role.name,
      description: role.description,
      baseTier: role.baseTier,
      isSystem: role.isSystem,
      permissions: { ...role.permissions },
    });
    setErrorMsg(null);
  };

  const toggleDraftPermission = (key: PermissionKey) => {
    if (!editingRole) return;
    if (editingRole.isSystem && key === 'manageRoles') return;
    const nextPerms: AdminPermissions = {
      ...editingRole.permissions,
      [key]: !editingRole.permissions[key],
    };
    // Auto-enable companion read permission when enabling a write permission
    if (key === 'editProductsPricing' && nextPerms.editProductsPricing) {
      nextPerms.viewProducts = true;
    }
    if (key === 'manageRfqs' && nextPerms.manageRfqs) {
      nextPerms.viewRfqs = true;
    }
    if (key === 'editMarket' && nextPerms.editMarket) {
      nextPerms.viewMarket = true;
    }
    if (key === 'manageDocuments' && nextPerms.manageDocuments) {
      nextPerms.viewDocuments = true;
    }
    setEditingRole({
      ...editingRole,
      permissions: nextPerms,
      baseTier: editingRole.isSystem
        ? 'superadmin'
        : deriveBaseTierFromPermissions(nextPerms),
    });
  };

  const applyPresetToDraft = (presetId: string) => {
    if (!editingRole || editingRole.isSystem) return;
    const preset = DEFAULT_ROLE_DEFINITIONS.find((p) => p.id === presetId);
    if (!preset) return;
    setEditingRole({
      ...editingRole,
      baseTier: preset.baseTier,
      permissions: { ...preset.permissions },
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setErrorMsg(null);

    const name = editingRole.name.trim();
    const id = isNewRole
      ? sanitizeDocId(editingRole.id || name)
      : editingRole.id;
    const description = editingRole.description.trim();

    if (name.length < 2) {
      setErrorMsg('Role name must be at least 2 characters.');
      return;
    }
    if (!id || id.length < 2) {
      setErrorMsg('Role ID slug must be at least 2 alphanumeric characters.');
      return;
    }
    if (isNewRole && roleMap.has(id)) {
      setErrorMsg(`A role with ID "${id}" already exists. Choose a unique slug.`);
      return;
    }
    if (description.length < 2) {
      setErrorMsg('Provide a concise description of this role’s responsibilities.');
      return;
    }

    setRoleSaving(true);
    try {
      const impactedMembers = admins.filter((a) => a.roleId === id);
      const previousRole = isNewRole ? null : (roleMap.get(id) ?? null);
      await saveRoleDefinitionAndSyncMembers(
        {
          id,
          name,
          description,
          baseTier: editingRole.isSystem ? 'superadmin' : editingRole.baseTier,
          isSystem: editingRole.isSystem,
          permissions: editingRole.isSystem
            ? { ...FULL_PERMISSIONS }
            : editingRole.permissions,
        },
        impactedMembers,
        !isNewRole,
        previousRole,
      );
      setEditingRole(null);
      flashSaved(
        isNewRole
          ? `Created custom role "${name}".`
          : `Saved "${name}" and synced permissions to ${impactedMembers.length} assigned operator${impactedMembers.length === 1 ? '' : 's'}.`,
      );
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleDefinition) => {
    const assignedCount = memberCountByRoleId[role.id] ?? 0;
    if (role.isSystem) {
      setErrorMsg('Built-in Superadmin role cannot be deleted.');
      return;
    }
    if (assignedCount > 0) {
      setErrorMsg(
        `Reassign all ${assignedCount} team member(s) away from "${role.name}" before deleting it.`,
      );
      return;
    }
    setErrorMsg(null);
    try {
      await deleteRoleDefinition(role.id, role.name);
      setConfirmDeleteRoleId(null);
      flashSaved(`Deleted role template "${role.name}".`);
    } catch (err) {
      setErrorMsg(formatFirestoreErrorMessage(err));
    }
  };

  const selectedOnboardRole = roleMap.get(newMember.roleId);

  return (
    <div className="space-y-6">
      {/* 3-Column Governance Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
            Defined Access Roles
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
            {roleDefinitions.length}
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            Granular role templates stored in Firestore
          </div>
        </div>

        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
            Active Team Operators
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0E4D64] tabular-nums">
            {activeOperatorsCount}
            <span className="text-base font-normal text-[#708294]">
              {' '}
              / {admins.length}
            </span>
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            Verified Google Workspace identities
          </div>
        </div>

        <div className="bg-white border border-[#E5EBF0] rounded-xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
            Enforced Permission Gates
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-[#0B1520] tabular-nums">
            12
          </div>
          <div className="mt-1 text-xs text-[#4A5B6C]">
            Dual-enforced in Firestore Rules & Console UI
          </div>
        </div>
      </div>

      {/* Empty Role Definitions Bootstrap Banner */}
      {roleDefinitions.length === 0 && canManageRoles && (
        <div className="p-5 rounded-xl bg-white border border-[#0E4D64]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#0E4D64]">
              Initialize Institutional Role Templates
            </div>
            <p className="text-xs text-[#4A5B6C]">
              Seed the 4 baseline PetroTechnics roles (Superadmin, Pricing Manager, Sales Lead, Read-Only Analyst) into Firestore to begin assigning granular access levels.
            </p>
          </div>
          <button
            type="button"
            disabled={initializingRoles}
            onClick={() => void onInitializeDefaultRoles()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${initializingRoles ? 'animate-spin' : ''}`}
            />
            <span>
              {initializingRoles ? 'Initializing...' : 'Initialize Baseline Roles'}
            </span>
          </button>
        </div>
      )}

      {/* Segmented Sub-Tab Navigation + Contextual Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center border border-[#E5EBF0] rounded-lg bg-white p-1">
          <button
            type="button"
            onClick={() => setSubTab('members')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              subTab === 'members'
                ? 'bg-[#0B1520] text-white'
                : 'text-[#4A5B6C] hover:text-[#0B1520]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team Members ({admins.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('definitions')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              subTab === 'definitions'
                ? 'bg-[#0B1520] text-white'
                : 'text-[#4A5B6C] hover:text-[#0B1520]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Role Definitions & Matrix ({roleDefinitions.length})</span>
          </button>
        </div>

        {canManageRoles && (
          <div className="flex items-center gap-2">
            {subTab === 'members' ? (
              <button
                type="button"
                disabled={roleDefinitions.length === 0}
                onClick={openOnboardDrawer}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard Team Member</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateRoleDrawer}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Role</span>
              </button>
            )}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          {errorMsg}
        </div>
      )}
      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 inline-flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 1: INTERNAL TEAM MEMBERS & ROLE ASSIGNMENTS                 */}
      {/* =================================================================== */}
      {subTab === 'members' && (
        <div className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#708294] absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search operator name, email, UID..."
                  className="ps-9 pe-3.5 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg w-64 text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white border border-[#E5EBF0] rounded-lg text-[#0B1520] focus:outline-none focus:border-[#0E4D64]"
              >
                <option value="all">All Access Roles</option>
                {roleDefinitions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex items-center gap-2 text-[11px] text-[#708294]">
              <span>Your UID:</span>
              <code className="font-mono-data text-[#0B1520] bg-white border border-[#E5EBF0] px-2 py-1 rounded">
                {currentUid.slice(0, 14)}...
              </code>
              <button
                type="button"
                onClick={() => handleCopyUid(currentUid)}
                className="inline-flex items-center gap-1 text-[#0E4D64] font-semibold hover:underline cursor-pointer"
              >
                {copiedUid === currentUid ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Team Directory High-Density Table */}
          <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                    <th className="py-2.5 px-4 text-start">Team Member</th>
                    <th className="py-2.5 px-3 text-start">Firebase UID</th>
                    <th className="py-2.5 px-3 text-start">Assigned Access Level</th>
                    <th className="py-2.5 px-3 text-start">Effective Scope</th>
                    <th className="py-2.5 px-3 text-start">Status</th>
                    <th className="py-2.5 px-4 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EBF0]">
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 px-4 text-center text-[#708294]"
                      >
                        No internal team members match this filter. Use “Onboard Team Member” to grant role-scoped console access.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((adm) => {
                      const isSelf = adm.uid === currentUid;
                      const permCount = countEnabledPermissions(adm.permissions);
                      const isActive = adm.status === 'active';
                      return (
                        <tr
                          key={adm.uid}
                          className="hover:bg-[#F7F9FB]/70 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#0B1520] flex items-center gap-1.5">
                              <span>{adm.displayName}</span>
                              {isSelf && (
                                <span className="text-[10px] font-mono-data uppercase text-[#0E4D64]">
                                  (Current Session)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono-data text-[#708294]">
                              {adm.email}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="inline-flex items-center gap-1.5 font-mono-data text-[11px] text-[#4A5B6C]">
                              <span>{adm.uid.slice(0, 12)}...</span>
                              <button
                                type="button"
                                onClick={() => handleCopyUid(adm.uid)}
                                title="Copy full Firebase UID"
                                className="p-1 text-[#708294] hover:text-[#0B1520] cursor-pointer"
                              >
                                {copiedUid === adm.uid ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {canManageRoles && !isSelf && roleDefinitions.length > 0 ? (
                              <select
                                disabled={busyUid === adm.uid}
                                value={
                                  roleMap.has(adm.roleId)
                                    ? adm.roleId
                                    : roleDefinitions[0].id
                                }
                                onChange={(e) =>
                                  void handleReassignRole(adm, e.target.value)
                                }
                                className="px-2.5 py-1.5 text-xs font-medium text-[#0B1520] bg-white border border-[#CBD5E1] rounded-md focus:outline-none focus:border-[#0E4D64] disabled:opacity-50"
                              >
                                {roleDefinitions.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-[#0B1520]">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#0E4D64]" />
                                <span>{adm.roleName}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono-data text-[11px] font-semibold text-[#0B1520] tabular-nums">
                              {permCount} / 12 perms
                            </div>
                            <div className="text-[11px] text-[#708294]">
                              {summarizeOperatorAccess(adm.permissions)}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1.5 font-semibold ${
                                isActive ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isActive ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Slash className="w-3.5 h-3.5" />
                              )}
                              <span>{isActive ? 'Active' : 'Suspended'}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-end">
                            <div className="inline-flex items-center gap-2">
                              {canManageRoles && !isSelf && (
                                <button
                                  type="button"
                                  disabled={busyUid === adm.uid}
                                  onClick={() => void handleToggleMemberStatus(adm)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-[#4A5B6C] border border-[#E5EBF0] hover:bg-[#F7F9FB] rounded cursor-pointer disabled:opacity-50"
                                >
                                  {isActive ? 'Suspend' : 'Restore'}
                                </button>
                              )}
                              {canManageRoles && !isSelf && (
                                <>
                                  {confirmDeleteUid === adm.uid ? (
                                    <button
                                      type="button"
                                      onClick={() => void handleDeleteMember(adm.uid)}
                                      className="px-2 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteUid(adm.uid)}
                                      title="Remove operator"
                                      className="p-1.5 text-[#708294] hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 2: ROLE DEFINITIONS & GRANULAR PERMISSION MATRIX            */}
      {/* =================================================================== */}
      {subTab === 'definitions' && (
        <div className="bg-white border border-[#E5EBF0] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5EBF0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-sm font-bold text-[#0B1520]">
                Granular Access Level Matrix
              </h3>
              <p className="text-xs text-[#708294]">
                Editing any role template atomically updates permissions for all currently assigned team members.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5EBF0] bg-[#F7F9FB] text-[11px] font-semibold uppercase tracking-wider text-[#708294]">
                  <th className="py-2.5 px-4 text-start">Role Template</th>
                  <th className="py-2.5 px-3 text-end">Members</th>
                  <th className="py-2.5 px-3 text-start">Catalog & FOB</th>
                  <th className="py-2.5 px-3 text-start">RFQ Desk</th>
                  <th className="py-2.5 px-3 text-start">Market & Map</th>
                  <th className="py-2.5 px-3 text-start">Doc Vault</th>
                  <th className="py-2.5 px-3 text-start">Governance</th>
                  <th className="py-2.5 px-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EBF0]">
                {roleDefinitions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 px-4 text-center text-[#708294]"
                    >
                      No role definitions found. Initialize the baseline PetroTechnics roles above or create a custom role.
                    </td>
                  </tr>
                ) : (
                  roleDefinitions.map((role) => {
                    const assignedCount = memberCountByRoleId[role.id] ?? 0;
                    const catalogAccess = describeModuleAccess(
                      role.permissions,
                      'viewProducts',
                      'editProductsPricing',
                    );
                    const rfqAccess = describeModuleAccess(
                      role.permissions,
                      'viewRfqs',
                      'manageRfqs',
                    );
                    const marketAccess = describeModuleAccess(
                      role.permissions,
                      'viewMarket',
                      'editMarket',
                    );
                    const vaultAccess = describeModuleAccess(
                      role.permissions,
                      'viewDocuments',
                      'manageDocuments',
                    );
                    const govParts: string[] = [];
                    if (role.permissions.editSettings) govParts.push('FX/Desks');
                    if (role.permissions.manageRoles) govParts.push('RBAC');
                    if (role.permissions.deleteRecords) govParts.push('Delete');

                    const renderCell = (cell: {
                      label: string;
                      tone: 'write' | 'read' | 'none';
                    }) => (
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          cell.tone === 'write'
                            ? 'text-[#0E4D64] font-semibold'
                            : cell.tone === 'read'
                              ? 'text-[#4A5B6C]'
                              : 'text-[#94A3B8]'
                        }`}
                      >
                        {cell.tone === 'write' && <Edit3 className="w-3 h-3" />}
                        {cell.tone === 'read' && <Eye className="w-3 h-3" />}
                        <span>{cell.label}</span>
                      </span>
                    );

                    return (
                      <tr
                        key={role.id}
                        className="hover:bg-[#F7F9FB]/70 transition-colors"
                      >
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-[#0B1520] flex items-center gap-1.5">
                            {role.isSystem ? (
                              <Lock className="w-3.5 h-3.5 text-[#0E4D64] shrink-0" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-[#708294] shrink-0" />
                            )}
                            <span>{role.name}</span>
                          </div>
                          <div className="text-[11px] text-[#708294] mt-0.5 line-clamp-2 leading-relaxed">
                            {role.description}
                          </div>
                          <div className="text-[10px] font-mono-data text-[#94A3B8] mt-1">
                            {role.id} · {countEnabledPermissions(role.permissions)}/12 perms
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-end font-mono-data font-semibold tabular-nums text-[#0B1520]">
                          {assignedCount}
                        </td>
                        <td className="py-3.5 px-3">{renderCell(catalogAccess)}</td>
                        <td className="py-3.5 px-3">{renderCell(rfqAccess)}</td>
                        <td className="py-3.5 px-3">{renderCell(marketAccess)}</td>
                        <td className="py-3.5 px-3">{renderCell(vaultAccess)}</td>
                        <td className="py-3.5 px-3">
                          {govParts.length > 0 ? (
                            <span className="font-semibold text-[#0B1520]">
                              {govParts.join(' · ')}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8]">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-end">
                          <div className="inline-flex items-center gap-1.5">
                            {canManageRoles && (
                              <button
                                type="button"
                                onClick={() => openEditRoleDrawer(role)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#0E4D64] hover:bg-[#0E4D64]/10 rounded cursor-pointer whitespace-nowrap"
                              >
                                {role.isSystem ? 'Inspect' : 'Edit Matrix'}
                              </button>
                            )}
                            {canManageRoles && !role.isSystem && (
                              <>
                                {confirmDeleteRoleId === role.id ? (
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteRole(role)}
                                    className="px-2 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={assignedCount > 0}
                                    title={
                                      assignedCount > 0
                                        ? 'Reassign assigned members before deleting this role'
                                        : 'Delete custom role'
                                    }
                                    onClick={() => setConfirmDeleteRoleId(role.id)}
                                    className="p-1.5 text-[#708294] hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SLIDE-OVER DRAWER 1: ONBOARD INTERNAL TEAM MEMBER                   */}
      {/* =================================================================== */}
      {memberDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b border-[#E5EBF0] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  Onboard Internal Team Member
                </h3>
                <p className="text-xs text-[#708294]">
                  Bind a verified Google Workspace Firebase UID to a granular PetroTechnics access role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMemberDrawerOpen(false)}
                className="p-2 text-[#4A5B6C] hover:text-[#0B1520] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => void handleCreateMember(e)}
              className="p-6 space-y-5 flex-1 text-xs"
            >
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                  Firebase Auth UID
                </label>
                <input
                  type="text"
                  required
                  value={newMember.uid}
                  onChange={(e) =>
                    setNewMember({ ...newMember, uid: e.target.value })
                  }
                  placeholder="Paste the operator's Firebase Auth UID"
                  className="w-full px-3 py-2 font-mono-data border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0E4D64]"
                />
                <p className="text-[11px] text-[#708294] mt-1">
                  New operators see their Firebase UID on the Admin sign-in screen prior to activation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newMember.email}
                    onChange={(e) =>
                      setNewMember({ ...newMember, email: e.target.value })
                    }
                    placeholder="analyst@petrotechnic.co"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0E4D64]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.displayName}
                    onChange={(e) =>
                      setNewMember({ ...newMember, displayName: e.target.value })
                    }
                    placeholder="e.g. Leyla Karim"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0E4D64]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                  Assigned Access Level
                </label>
                <select
                  value={newMember.roleId}
                  onChange={(e) =>
                    setNewMember({ ...newMember, roleId: e.target.value })
                  }
                  className="w-full px-3 py-2 font-medium bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#0E4D64]"
                >
                  {roleDefinitions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({countEnabledPermissions(r.permissions)}/12 permissions)
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Permission Preview for Selected Role */}
              {selectedOnboardRole && (
                <div className="p-4 rounded-xl bg-[#F7F9FB] border border-[#E5EBF0] space-y-3">
                  <div>
                    <div className="font-semibold text-[#0B1520]">
                      Effective Access Preview: {selectedOnboardRole.name}
                    </div>
                    <p className="text-[11px] text-[#708294] mt-0.5">
                      {selectedOnboardRole.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E5EBF0]">
                    {PERMISSION_MODULES.flatMap((m) => m.items).map((perm) => {
                      const granted = selectedOnboardRole.permissions[perm.key];
                      return (
                        <div
                          key={perm.key}
                          className={`flex items-center gap-2 text-[11px] ${
                            granted
                              ? 'text-[#0B1520] font-medium'
                              : 'text-[#94A3B8] line-through'
                          }`}
                        >
                          {granted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
                          )}
                          <span>{perm.shortLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-[#E5EBF0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMemberDrawerOpen(false)}
                  className="px-4 py-2 font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg hover:bg-[#F7F9FB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={memberSaving}
                  className="px-5 py-2 font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {memberSaving ? 'Saving to Firestore...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SLIDE-OVER DRAWER 2: CREATE / EDIT ROLE DEFINITION PERMISSION MATRIX*/}
      {/* =================================================================== */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-[#061E29]/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto border-s border-[#E5EBF0] flex flex-col">
            <div className="sticky top-0 z-10 bg-white border-b border-[#E5EBF0] px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0B1520]">
                  {isNewRole
                    ? 'Create Granular Access Role'
                    : editingRole.isSystem
                      ? `System Role: ${editingRole.name}`
                      : `Edit Role Matrix: ${editingRole.name}`}
                </h3>
                <p className="text-xs text-[#708294]">
                  {editingRole.isSystem
                    ? 'Built-in Superadmin retains full governance permissions to prevent administrative lockout.'
                    : 'Configure module-level permissions. Saving syncs all assigned operators atomically.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="p-2 text-[#4A5B6C] hover:text-[#0B1520] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => void handleSaveRole(e)}
              className="p-6 space-y-6 flex-1 text-xs"
            >
              {/* Role Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Role Display Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingRole.isSystem}
                    value={editingRole.name}
                    onChange={(e) => {
                      const nextName = e.target.value;
                      setEditingRole({
                        ...editingRole,
                        name: nextName,
                        id: isNewRole ? sanitizeDocId(nextName) : editingRole.id,
                      });
                    }}
                    placeholder="e.g. Regional Pricing Analyst"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                    Role Identifier Slug
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isNewRole}
                    value={editingRole.id}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        id: sanitizeDocId(e.target.value),
                      })
                    }
                    placeholder="e.g. regional-pricing-analyst"
                    className="w-full px-3 py-2 font-mono-data border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#4A5B6C] mb-1">
                  Role Scope Description
                </label>
                <textarea
                  rows={2}
                  required
                  disabled={editingRole.isSystem}
                  value={editingRole.description}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what commercial or operational desk functions this role performs..."
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg disabled:bg-[#F7F9FB]"
                />
              </div>

              {/* Quick-Clone Presets when creating a new role */}
              {isNewRole && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-[#708294]">
                    Start from preset:
                  </span>
                  {DEFAULT_ROLE_DEFINITIONS.filter((p) => !p.isSystem).map(
                    (preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPresetToDraft(preset.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-[#0E4D64] bg-[#F7F9FB] border border-[#E5EBF0] hover:border-[#0E4D64] rounded-md cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ),
                  )}
                </div>
              )}

              {/* 6-Module Granular Permission Matrix */}
              <div className="space-y-4 pt-2 border-t border-[#E5EBF0]">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[#0B1520]">
                    Module Permission Matrix
                  </div>
                  <div className="font-mono-data text-[11px] font-semibold text-[#0E4D64] tabular-nums">
                    {countEnabledPermissions(editingRole.permissions)} / 12 Enabled
                  </div>
                </div>

                <div className="divide-y divide-[#E5EBF0] border border-[#E5EBF0] rounded-xl overflow-hidden">
                  {PERMISSION_MODULES.map((group) => (
                    <div key={group.id} className="p-4 bg-white space-y-3">
                      <div>
                        <div className="font-semibold text-[#0B1520]">
                          {group.title}
                        </div>
                        <div className="text-[11px] text-[#708294]">
                          {group.subtitle}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((perm) => {
                          const checked = editingRole.permissions[perm.key];
                          const disabled = editingRole.isSystem;
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                                checked
                                  ? 'bg-[#F7F9FB] border-[#0E4D64]/35'
                                  : 'bg-white border-[#E5EBF0]'
                              } ${disabled ? 'opacity-75' : 'cursor-pointer hover:border-[#0E4D64]/50'}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggleDraftPermission(perm.key)}
                                className="mt-0.5 h-4 w-4 accent-[#0E4D64] rounded cursor-pointer disabled:cursor-not-allowed"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-[#0B1520]">
                                    {perm.label}
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono-data uppercase font-semibold ${
                                      perm.level === 'governance'
                                        ? 'text-amber-700'
                                        : perm.level === 'write'
                                          ? 'text-[#0E4D64]'
                                          : 'text-[#708294]'
                                    }`}
                                  >
                                    {perm.level}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#708294] mt-0.5 leading-relaxed">
                                  {perm.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!isNewRole && !editingRole.isSystem && (
                <div className="p-3 rounded-lg bg-[#F7F9FB] border border-[#E5EBF0] text-[11px] text-[#4A5B6C]">
                  Saving changes will immediately sync this permission matrix to{' '}
                  <span className="font-mono-data font-semibold text-[#0B1520]">
                    {memberCountByRoleId[editingRole.id] ?? 0}
                  </span>{' '}
                  assigned team member(s) in Firestore.
                </div>
              )}

              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-[#E5EBF0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 font-semibold text-[#4A5B6C] border border-[#E5EBF0] rounded-lg hover:bg-[#F7F9FB] cursor-pointer"
                >
                  {editingRole.isSystem ? 'Close' : 'Cancel'}
                </button>
                {!editingRole.isSystem && (
                  <button
                    type="submit"
                    disabled={roleSaving}
                    className="px-5 py-2 font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    {roleSaving
                      ? 'Syncing to Firestore...'
                      : isNewRole
                        ? 'Create Role'
                        : 'Save & Sync Members'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
