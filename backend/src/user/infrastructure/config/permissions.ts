import {Permissions} from "@/user/domain/constants/permission";
import {PermissionGroup} from "@/user/domain/constants/permission-group";
import {DefaultAdminRoleName} from "@/user/domain/constants/default-admin-role-name";


export default [
    {
        name: Permissions.VIEW_ROLES,
        description:'View Roles ',
        group:PermissionGroup.ROLES_MANAGEMENT,
        roles:[
            DefaultAdminRoleName.SUPER_ADMIN,
            DefaultAdminRoleName.ADMIN,
            DefaultAdminRoleName.MANAGER,
            DefaultAdminRoleName.MODERATOR,
        ]
    },
    {
        name: Permissions.UPDATE_ROLES,
        description:'Update Roles',
        group:PermissionGroup.ROLES_MANAGEMENT,
        roles:[
            DefaultAdminRoleName.SUPER_ADMIN,
            DefaultAdminRoleName.ADMIN
        ]
    },
    {
        name: Permissions.CREATE_ROLES,
        description:'Create Roles',
        group:PermissionGroup.ROLES_MANAGEMENT,
        roles:[
            DefaultAdminRoleName.SUPER_ADMIN,
            DefaultAdminRoleName.ADMIN
        ]
    },
    {
        name: Permissions.DELETE_ROLES,
        description:'Delete Roles',
        group:PermissionGroup.ROLES_MANAGEMENT,
        roles:[
            DefaultAdminRoleName.SUPER_ADMIN,
            DefaultAdminRoleName.ADMIN
        ]
    },
    {
        name: Permissions.VIEW_DASHBOARD,
        description: "View Dashboard",
        group: PermissionGroup.DASHBOARD,
        roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
    },
    {
        name: Permissions.VIEW_PERMISSIONS,
        description: "View Permissions",
        group: PermissionGroup.PERMISSIONS_MANAGEMENT,
        roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
    },
    {
        name: Permissions.CREATE_PERMISSIONS,
        description: "Create Permissions",
        group: PermissionGroup.PERMISSIONS_MANAGEMENT,
        roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
    },
    {
        name: Permissions.UPDATE_PERMISSIONS,
        description: "Update Permissions",
        group: PermissionGroup.PERMISSIONS_MANAGEMENT,
        roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
    },
    {
        name: Permissions.DELETE_PERMISSIONS,
        description: "Delete Permissions",
        group: PermissionGroup.PERMISSIONS_MANAGEMENT,
        roles: [DefaultAdminRoleName.SUPER_ADMIN, DefaultAdminRoleName.ADMIN],
    },
];
