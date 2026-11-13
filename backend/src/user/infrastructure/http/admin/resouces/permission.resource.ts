import type { Permission } from "@/user/domain/entities/permission.entity";
import type { PermissionType } from "@/common/domain/permission.type";

export class PermissionResource {
  constructor(
    private readonly id: string,
    private readonly slug: PermissionType,
  ) {}

  public static make(permission: Permission): PermissionResource {
    return new PermissionResource(permission.getId().toString(), permission.getSlug());
  }
}
