

export const Permissions = {
    VIEW_DASHBOARD: 'dashboard.view',

    /**
     * @see PermissionGroup.ROLES_MANAGEMENT
     */
    VIEW_ROLES: 'roles.view',
    CREATE_ROLES: 'roles.create',
    UPDATE_ROLES: 'roles.update',
    DELETE_ROLES: 'roles.delete',


    /**
     * @see PermissionGroup.PERMISSIONS_MANAGEMENT
     */
    VIEW_PERMISSIONS: 'permissions.view',
    CREATE_PERMISSIONS: 'permissions.create',
    UPDATE_PERMISSIONS: "permissions.update",
    DELETE_PERMISSIONS: "permissions.delete"


} as const;

export type PermissionType = (typeof Permissions)[keyof typeof Permissions];

export const ALL_PERMISSIONS: readonly PermissionType[] = Object.values(Permissions);

