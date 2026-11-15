/** Действия серверного контракта доступа. */
export const ACCESS_ACTION = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
} as const;

/** Ресурсы, для которых интерфейс поддерживает проверку доступа. */
export const ACCESS_SUBJECT = {
  ROLES: "roles",
  PERMISSIONS: "permissions",
} as const;

/** Именованные разрешения: компоненты не зависят от строк серверного контракта. */
export const ACCESS_PERMISSION = {
  VIEW_ROLES: { action: ACCESS_ACTION.VIEW, subject: ACCESS_SUBJECT.ROLES },
  CREATE_ROLES: { action: ACCESS_ACTION.CREATE, subject: ACCESS_SUBJECT.ROLES },
  UPDATE_ROLES: { action: ACCESS_ACTION.UPDATE, subject: ACCESS_SUBJECT.ROLES },
  DELETE_ROLES: { action: ACCESS_ACTION.DELETE, subject: ACCESS_SUBJECT.ROLES },
  VIEW_PERMISSIONS: {
    action: ACCESS_ACTION.VIEW,
    subject: ACCESS_SUBJECT.PERMISSIONS,
  },
  CREATE_PERMISSIONS: {
    action: ACCESS_ACTION.CREATE,
    subject: ACCESS_SUBJECT.PERMISSIONS,
  },
  UPDATE_PERMISSIONS: {
    action: ACCESS_ACTION.UPDATE,
    subject: ACCESS_SUBJECT.PERMISSIONS,
  },
  DELETE_PERMISSIONS: {
    action: ACCESS_ACTION.DELETE,
    subject: ACCESS_SUBJECT.PERMISSIONS,
  },
} as const;
