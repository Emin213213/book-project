import { Controller, Get, UseGuards } from '@nestjs/common';

import { FindAllPermissionAction } from '@/user/application/actions/admin/permission/find-all-permission.action';
import { PermissionResource } from '@/user/infrastructure/http/admin/resouces/permission.resource';
import { AuthGuard } from '@/user/infrastructure/http/guards/auth.guard';
import { Permissions,  } from '@/user/domain/constants/permission';
import { PermissionGuard } from '@/user/infrastructure/http/guards/permission.guard';
import {REQUIRED_PERMISSIONS} from "@/user/infrastructure/decorators/required-permission.decorator";

@Controller('admin/permissions')
export class PermissionController {
  constructor(private readonly findAllPermissionAction: FindAllPermissionAction) {}

  @Get()
  @UseGuards(AuthGuard, PermissionGuard)
  @REQUIRED_PERMISSIONS([Permissions.VIEW_PERMISSIONS])
  public async findAll(): Promise<PermissionResource[]> {
    const permissions = await this.findAllPermissionAction.handle();

    return permissions.map((permission) => PermissionResource.make(permission));
  }

  public async  update():Promise<void> {

  }
}
