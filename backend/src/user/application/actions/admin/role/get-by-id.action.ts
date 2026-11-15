import { Inject, Injectable } from "@nestjs/common";

import type { Uuid } from "@/common/domain/value-objects/uuid.vo";
import type { Role } from "@/user/domain/entities/role.entity";
import { RoleNotFoundException } from "@/user/domain/exceptions/role-not-found.exception";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "@/user/domain/repositories/role.repository.interface";

/** Получает роль вместе с назначенными разрешениями. */
@Injectable()
export class GetByIdAction {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  public async handle(id: Uuid): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (role === undefined) {
      throw new RoleNotFoundException(id.toString());
    }
    return role;
  }
}
