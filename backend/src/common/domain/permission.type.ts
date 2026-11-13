import type { PermissionType as BookPermission } from "@/book/domain/constants/permission";
import type { PermissionType as UserPermission } from "@/user/domain/constants/permission";

/** Разрешения всех модулей приложения. */
export type PermissionType = BookPermission | UserPermission;
