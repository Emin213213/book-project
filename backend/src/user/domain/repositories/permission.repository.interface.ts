import type { Permission } from '@/user/domain/entities/permission.entity';
import type { PermissionType } from "@/common/domain/permission.type";

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface IPermissionRepository {
  findAll(): Promise<Permission[]>;

  findBySlug(slug: PermissionType): Promise<Permission | undefined>;

  findByDescription(description: string): Promise<Permission | undefined>;
  
  save(permission: Permission): Promise<void>;

  update(permission: Permission | undefined): Promise<void>;
}
