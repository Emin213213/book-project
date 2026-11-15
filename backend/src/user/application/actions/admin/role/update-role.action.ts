import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import type { Uuid } from "@/common/domain/value-objects/uuid.vo";
import type { UpdateRoleDto } from "@/user/application/input/admin/role/update-role.dto";
import type { Role } from "@/user/domain/entities/role.entity";
import { RoleNotFoundException } from "@/user/domain/exceptions/role-not-found.exception";
import { RoleExistException } from "@/user/domain/exceptions/role/role-exist.exception";
import { ROLE_REPOSITORY } from "@/user/domain/repositories/role.repository.interface";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";

import type { Permission } from "@/user/domain/entities/permission.entity";
import { PERMISSION_REPOSITORY } from "@/user/domain/repositories/permission.repository.interface";
import type { IPermissionRepository } from "@/user/domain/repositories/permission.repository.interface";

/** Проверяет и сохраняет название, slug и разрешения роли. */
@Injectable()
export class UpdateRoleAction {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  public async handle(id: Uuid, context: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (role === undefined) {
      throw new RoleNotFoundException(id.toString());
    }

    await this.validateSlug(context.slug, role.slug);
    if (context.permissions !== undefined) {
      role.permissions = await this.resolvePermissions(context.permissions);
    }

    role.name = context.name ?? role.name;
    role.slug = context.slug ?? role.slug;

    await this.roleRepository.update(role);
    return role;
  }
  private async validateSlug(
    slug: string | undefined,
    currentSlug: string,
  ): Promise<void> {
    if (slug !== undefined && slug !== currentSlug) {
      if (await this.roleRepository.findBySlug(slug)) {
        throw new RoleExistException();
      }
    }
  }

  private async resolvePermissions(
    slugs: readonly string[],
  ): Promise<Permission[]> {
    const available = await this.permissionRepository.findAll();
    const requested = new Set(slugs);
    const permissions = available.filter((permission) =>
      requested.has(permission.getSlug()),
    );
    if (permissions.length !== requested.size) {
      throw new BadRequestException("Unknown permission");
    }
    return permissions;
  }
}
