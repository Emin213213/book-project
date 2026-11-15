import {Inject, Injectable} from "@nestjs/common";

import type {FindAllRolesDto} from "@/user/application/input/admin/role/findAllRoles.dto";
import type {IRoleRepository} from "@/user/domain/repositories/role.repository.interface";
import {ROLE_REPOSITORY} from "@/user/domain/repositories/role.repository.interface";
import type {Role} from "@/user/domain/entities/role.entity";

/** Получает роли с фильтром по названию. */
@Injectable()
export class FindAllRoleAction {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  public async handle(context: FindAllRolesDto): Promise<Role[]> {
    return this.roleRepository.findAll(context.role);
  }
}
