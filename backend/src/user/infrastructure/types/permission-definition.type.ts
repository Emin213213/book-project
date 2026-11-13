import type { PermissionType } from "@/common/domain/permission.type";

export  type PermissionDefinition   = {
    name:PermissionType,
    description:string,
    group:string,
    roles:string[]
}