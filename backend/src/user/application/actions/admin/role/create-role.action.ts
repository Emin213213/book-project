import { Inject, Injectable } from "@nestjs/common";

import { Uuid } from "@/common/domain/value-objects/uuid.vo";
import type { CreateRoleDto } from "@/user/application/input/admin/role/create-role.dto";
import { Role } from "@/user/domain/entities/role.entity";
import { RoleExistException } from "@/user/domain/exceptions/role/role-exist.exception";
import { ROLE_REPOSITORY } from "@/user/domain/repositories/role.repository.interface";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";

/** Создаёт обычную роль; системные роли создаются вне публичного API. */
@Injectable()
export class CreateRoleAction {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  public async handle(context: CreateRoleDto): Promise<Role> {

    if (await this.roleRepository.findBySlug(context.slug)) {
      throw new RoleExistException();
    }

    const role = Role.create(
      Uuid.generate(),
      context.name,
      context.slug,
      false,
    );

    await this.roleRepository.save(role);
    return role;
  }
}
