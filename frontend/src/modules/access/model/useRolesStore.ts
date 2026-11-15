import { create } from "zustand";

import type { AdminRole, UpdateAdminRole } from "./admin-role.types";

type RolesState = {
  readonly search: string;
  readonly selectedRoleId: string | undefined;
  readonly editingRole: AdminRole | undefined;
  readonly editorSession: string | undefined;
  readonly permissions: AdminRole["permissions"];
  readonly changeSearch: (search: string) => void;
  readonly selectRole: (roleId: string) => void;
  readonly selectCreatedRole: (roleId: string) => void;
  readonly openEditor: (role: AdminRole, session: string | undefined) => void;
  readonly closeEditor: () => void;
  readonly reset: () => void;
  readonly finishSave: (roleId: string, session: string | undefined) => void;
  readonly isSaving: boolean;
  readonly isSaved: boolean;
  readonly saveError: Error | undefined;
  readonly beginSave: () => void;
  readonly failSave: (
    error: Error,
    roleId: string,
    session: string | undefined,
  ) => void;
  readonly togglePermission: (module: string, action: string) => void;
  readonly getRoleUpdate: (name: string) => UpdateAdminRole;
  readonly applySavedRole: (
    role: AdminRole,
    session: string | undefined,
  ) => void;
};

/** Хранит выбор роли и её черновик без передачи состояния через дерево компонентов. */
export const useRolesStore = create<RolesState>((set, get) => ({
  isSaving: false,
  isSaved: false,
  saveError: undefined,
  search: "",
  selectedRoleId: undefined,
  editingRole: undefined,
  editorSession: undefined,
  permissions: {},

  changeSearch(search): void {
    set({ search });
  },

  selectRole(roleId): void {
    set({ selectedRoleId: roleId });
  },

  selectCreatedRole(roleId): void {
    set({ selectedRoleId: roleId, search: "" });
  },

  openEditor(role, session): void {
    if (get().editingRole?.id === role.id && get().editorSession === session) {
      return;
    }
    set({
      editingRole: role,
      editorSession: session,
      permissions: role.permissions,
      isSaving: false,
      isSaved: false,
      saveError: undefined,
    });
  },

  closeEditor(): void {
    set({
      editingRole: undefined,
      editorSession: undefined,
      permissions: {},
      isSaving: false,
      isSaved: false,
      saveError: undefined,
    });
  },

  reset(): void {
    get().closeEditor();
    set({ search: "", selectedRoleId: undefined });
  },

  finishSave(roleId, session): void {
    if (get().editingRole?.id === roleId && get().editorSession === session) {
      set({ isSaving: false });
    }
  },

  beginSave(): void {
    set({ isSaving: true, isSaved: false, saveError: undefined });
  },

  failSave(error, roleId, session): void {
    if (get().editingRole?.id === roleId && get().editorSession === session) {
      set({ isSaving: false, isSaved: false, saveError: error });
    }
  },

  togglePermission(module, action): void {
    set((state) => {
      const modulePermissions = state.permissions[module] ?? [];
      const updatedPermissions = modulePermissions.includes(action)
        ? modulePermissions.filter((permission) => permission !== action)
        : [...modulePermissions, action];
      return {
        permissions: { ...state.permissions, [module]: updatedPermissions },
        isSaved: false,
        saveError: undefined,
      };
    });
  },

  getRoleUpdate(name): UpdateAdminRole {
    return { name: name.trim(), permissions: get().permissions };
  },

  applySavedRole(role, session): void {
    if (get().editingRole?.id !== role.id || get().editorSession !== session) {
      return;
    }
    set({
      editingRole: role,
      permissions: role.permissions,
      isSaved: true,
      saveError: undefined,
    });
  },
}));
