import {Inject, Injectable} from "@nestjs/common";

import type {FindAllRolesDto} from "@/user/application/input/admin/role/findAllRoles.dto";
import type {IRoleRepository} from "@/user/domain/repositories/role.repository.interface";
import {ROLE_REPOSITORY} from "@/user/domain/repositories/role.repository.interface";
import {ListAllOutput} from "@/user/application/output/list-all.output";

/** Получает роли с учётом фильтров по роли и разрешению. */
@Injectable()
export class FindAllRoleAction {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  public async handle(context: FindAllRolesDto): Promise<ListAllOutput> {

    const [items,total] =  await  this.roleRepository.findAll(context.page,context.per_page,context.role);

    return new ListAllOutput(items,total,context.page,context.per_page)

  }

}
