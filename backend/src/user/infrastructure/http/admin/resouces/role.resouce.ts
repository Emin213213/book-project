import type {Role} from "@/user/domain/entities/role.entity";
import {PermissionService} from "@/user/infrastructure/service/permission.service";

/** Представляет роль и её разрешения в ответе API. */

export class RoleResouce {
  public readonly id: string;
  public readonly name: string;
  public readonly slug: string;
  public readonly is_system: boolean;
  public readonly permissions: {[key:string]:string[]};


  private constructor(role: Role,permissionService:PermissionService) {
    this.id = role.getId().toString();
    this.name = role.name;
    this.slug = role.slug;
    this.is_system = role.isSystem;
    this.permissions = permissionService.mapper(role)
  }

  public static make(role: Role,permissionService:PermissionService): RoleResouce {
    return new RoleResouce(role,permissionService);
  }

  public static  collection(roles:Role[],permissionService:PermissionService):RoleResouce[] {
    return roles.map((role) => RoleResouce.make(role,permissionService) );
  }
}
