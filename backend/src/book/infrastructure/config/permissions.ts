import { PermissionGroup } from "@/book/domain/constants/permission-group";
import { Permissions } from "@/book/domain/constants/permission";
import { DefaultAdminRoleName } from "@/user/domain/constants/default-admin-role-name";
import type { PermissionDefinition } from "@/user/infrastructure/types/permission-definition.type";

export default [
  {
    name: Permissions.VIEW_BOOKS,
    description: "View Books",
    group: PermissionGroup.BOOKS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.CREATE_BOOKS,
    description: "Create Books",
    group: PermissionGroup.BOOKS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.UPDATE_BOOKS,
    description: "Update Books",
    group: PermissionGroup.BOOKS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.DELETE_BOOKS,
    description: "Delete Books",
    group: PermissionGroup.BOOKS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.VIEW_AUTHORS,
    description: "View Authors",
    group: PermissionGroup.AUTHORS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.CREATE_AUTHORS,
    description: "Create Authors",
    group: PermissionGroup.AUTHORS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.UPDATE_AUTHORS,
    description: "Update Authors",
    group: PermissionGroup.AUTHORS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.DELETE_AUTHORS,
    description: "Delete Authors",
    group: PermissionGroup.AUTHORS_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.VIEW_CATEGORIES,
    description: "View Categories",
    group: PermissionGroup.CATEGORIES_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.CREATE_CATEGORIES,
    description: "Create Categories",
    group: PermissionGroup.CATEGORIES_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.UPDATE_CATEGORIES,
    description: "Update Categories",
    group: PermissionGroup.CATEGORIES_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
  {
    name: Permissions.DELETE_CATEGORIES,
    description: "Delete Categories",
    group: PermissionGroup.CATEGORIES_MANAGEMENT,
    roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
  },
] satisfies PermissionDefinition[];
