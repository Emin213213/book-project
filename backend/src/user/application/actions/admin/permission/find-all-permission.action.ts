import { Inject, Injectable } from '@nestjs/common';
import {
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '@/user/domain/repositories/permission.repository.interface';
import { Permission } from '@/user/domain/entities/permission.entity';

@Injectable()
export class FindAllPermissionAction {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository:IPermissionRepository,
  ) {}

  public async handle(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }
}
