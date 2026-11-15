import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { RoleResouce } from "./resouces/role.resouce";
import { Uuid } from "@/common/domain/value-objects/uuid.vo";
import { CreateRoleAction } from "@/user/application/actions/admin/role/create-role.action";
import { DeleteRoleAction } from "@/user/application/actions/admin/role/delete-role.action";
import { FindAllRoleAction } from "@/user/application/actions/admin/role/find-all-role.action";
import { UpdateRoleAction } from "@/user/application/actions/admin/role/update-role.action";
import { CreateRoleDto } from "@/user/application/input/admin/role/create-role.dto";
import { FindAllRolesDto } from "@/user/application/input/admin/role/findAllRoles.dto";
import { UpdateRoleDto } from "@/user/application/input/admin/role/update-role.dto";
import { Permissions, } from "@/user/domain/constants/permission";
import { AuthGuard } from "@/user/infrastructure/http/guards/auth.guard";
import { PermissionGuard } from "@/user/infrastructure/http/guards/permission.guard";
import {REQUIRED_PERMISSIONS} from "@/user/infrastructure/decorators/required-permission.decorator";
import {PermissionService} from "@/user/application/services/permission.service";
import {GetByIdAction} from "@/user/application/actions/admin/role/get-by-id.action";

@Injectable()
@Controller("admin/roles")
export class RoleController {
  constructor(
    @Inject() private readonly createRoleAction: CreateRoleAction,
    private readonly findAllRoleAction: FindAllRoleAction,
    private readonly updateRoleAction: UpdateRoleAction,
    private readonly deleteRoleAction: DeleteRoleAction,
    private  readonly  getByIdAction:GetByIdAction,
    @Inject() private  readonly  permissionService:PermissionService,
  ) {}


  @Get("/")
  @UseGuards(AuthGuard, PermissionGuard)
  @REQUIRED_PERMISSIONS([Permissions.VIEW_ROLES])
  public async findAll(
      @Query() context: FindAllRolesDto,
  ): Promise<{ data: RoleResouce[] }> {
    const roles = await this.findAllRoleAction.handle(context);
    return { data: RoleResouce.collection(roles, this.permissionService) };
  }


  @Get(":id")
  @UseGuards(AuthGuard, PermissionGuard)
  @REQUIRED_PERMISSIONS([Permissions.VIEW_ROLES, Permissions.VIEW_PERMISSIONS])
  public async getById(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<RoleResouce> {
    const role = await this.getByIdAction.handle(Uuid.fromString(id));

    return RoleResouce.make(role, this.permissionService);
  }

  @Post()
  @UseGuards(AuthGuard, PermissionGuard)
  @REQUIRED_PERMISSIONS([Permissions.CREATE_ROLES])
  public async create(@Body() context: CreateRoleDto): Promise<RoleResouce> {
    const role = await this.createRoleAction.handle(context);
    return RoleResouce.make(role,this.permissionService);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, PermissionGuard)
  @REQUIRED_PERMISSIONS([Permissions.UPDATE_ROLES])
  public async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() context: UpdateRoleDto,
  ): Promise<RoleResouce> {
    const role = await this.updateRoleAction.handle(
      Uuid.fromString(id),
      context,
    );
    return RoleResouce.make(role,this.permissionService);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, PermissionGuard)
  @REQUIRED_PERMISSIONS([Permissions.DELETE_ROLES])
  public async delete(@Param("id", new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteRoleAction.handle(Uuid.fromString(id));
  }


}
