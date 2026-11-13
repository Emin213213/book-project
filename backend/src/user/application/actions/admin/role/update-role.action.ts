import { Inject, Injectable } from "@nestjs/common";

import type { Uuid } from "@/common/domain/value-objects/uuid.vo";
import type { UpdateRoleDto } from "@/user/application/input/admin/role/update-role.dto";
import type { Role } from "@/user/domain/entities/role.entity";
import { RoleNotFoundException } from "@/user/domain/exceptions/role-not-found.exception";
import { RoleExistException } from "@/user/domain/exceptions/role/role-exist.exception";
import { ROLE_REPOSITORY } from "@/user/domain/repositories/role.repository.interface";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";

/** Сохраняет изменения имени и slug роли. */
@Injectable()
export class UpdateRoleAction {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  public async handle(id: Uuid, context: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (role === undefined) {
      throw new RoleNotFoundException(id.toString());
    }

    if (context.slug !== undefined && context.slug !== role.slug) {
      if (await this.roleRepository.findBySlug(context.slug)) {
        throw new RoleExistException();
      }
    }

    role.name = context.name ?? role.name;
    role.slug = context.slug ?? role.slug;

    await this.roleRepository.update(role);
    return role;
  }
}
