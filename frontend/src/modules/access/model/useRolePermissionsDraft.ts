import { useState } from 'react';

import type { AdminRole } from './admin-role.types';

type RolePermissionsDraft = {
  readonly permissions: AdminRole['permissions'];
  readonly isDirty: boolean;
  readonly togglePermission: (section: string, action: string) => void;
  readonly resetPermissions: () => void;
};

/** Хранит независимые черновики прав по ID роли, не изменяя данные API. */
export function useRolePermissionsDraft(role: AdminRole): RolePermissionsDraft {
  const [drafts, setDrafts] = useState<ReadonlyMap<string, AdminRole['permissions']>>(new Map());
  const resetPermissions = (): void => {
    setDrafts((previous) => {
      const next = new Map(previous);
      next.delete(role.id);
      return next;
    });
  };
  const togglePermission = (section: string, action: string): void => {
    setDrafts((previous) => {
      const permissions = previous.get(role.id) ?? role.permissions;
      const assigned = permissions[section] ?? [];
      const updated = assigned.includes(action)
        ? assigned.filter((permission) => permission !== action)
        : [...assigned, action];
      return new Map(previous).set(role.id, { ...permissions, [section]: updated });
    });
  };
  return {
    permissions: drafts.get(role.id) ?? role.permissions,
    isDirty: drafts.has(role.id),
    togglePermission,
    resetPermissions,
  };
}
