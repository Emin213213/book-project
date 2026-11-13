import { Inject, Injectable } from "@nestjs/common";

import type { Uuid } from "@/common/domain/value-objects/uuid.vo";
import { RoleNotFoundException } from "@/user/domain/exceptions/role-not-found.exception";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";
import { ROLE_REPOSITORY } from "@/user/domain/repositories/role.repository.interface";

/** Находит и удаляет роль по UUID. */
@Injectable()
export class DeleteRoleAction {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  public async handle(id: Uuid): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (role === undefined) {
      throw new RoleNotFoundException(id.toString());
    }

    await this.roleRepository.delete(id);
  }
}
