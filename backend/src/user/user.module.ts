import { RefreshSessionAction } from "./application/actions/session/refresh-session.action";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CreateUserAction } from "./application/actions/auth/create-user.action";
import { DeleteUserAction } from "./application/actions/auth/delete-user.action";
import { FindAllUsersAction } from "./application/actions/find-all-users.action";
import { UpdateUserAction } from "./application/actions/update-user.action";
import { TokenHasher } from "./application/services/token.hasher";
import { UserMailService } from "./application/services/user-mail.service";
import { Permission } from "./domain/entities/permission.entity";
import { Role } from "./domain/entities/role.entity";
import { Session } from "./domain/entities/session.entity";
import { User } from "./domain/entities/user.entity";
import { PERMISSION_REPOSITORY } from "./domain/repositories/permission.repository.interface";
import { ROLE_REPOSITORY } from "./domain/repositories/role.repository.interface";
import { SESSION_REPOSITORY } from "./domain/repositories/session.repository.interface";
import { USER_REPOSITORY } from "./domain/repositories/user.repository.interface";
import { PermissionRepository } from "./infrastructure/repository/permission.repository";
import { RoleRepository } from "./infrastructure/repository/role.repository";
import { SessionRepository } from "./infrastructure/repository/session.repository";
import { UserRepository } from "./infrastructure/repository/user.repository";
import { HasherService } from "@/common/application/services/hasher.service";
import { FindAllPermissionAction } from "@/user/application/actions/admin/permission/find-all-permission.action";
import { CreateRoleAction } from "@/user/application/actions/admin/role/create-role.action";
import { DeleteRoleAction } from "@/user/application/actions/admin/role/delete-role.action";
import { FindAllRoleAction } from "@/user/application/actions/admin/role/find-all-role.action";
import { UpdateRoleAction } from "@/user/application/actions/admin/role/update-role.action";
import { ConfirmOauthAction } from "@/user/application/actions/confirm-oauth.action";
import { ForgotPasswordAction } from "@/user/application/actions/forgot-password.action";
import { LoginByMailAction } from "@/user/application/actions/auth/login-by-mail.action";
import { ResetPasswordAction } from "@/user/application/actions/auth/reset-password.action";
import { UnnauthorizedResetAction } from "@/user/application/actions/unnauthorized-reset.action";
import { VerifycationEmailAction } from "@/user/application/actions/verifycation-email.action";
import { AuthConfigReader } from "@/user/application/services/auth-config.reader";
import { ConfigReader } from "@/user/application/services/config.reader";
import { FrontendLinkBuilder } from "@/user/application/services/frontend-link-builder";
import { GithubOauthProvider } from "@/user/application/services/github-oauth.provider";
import { GoogleOauthProvider } from "@/user/application/services/google-oauth.provider";
import { LinkedinOauthProvider } from "@/user/application/services/linkedin-oauth.provider";
import { OauthRegisterProvider } from "@/user/application/services/oauth-register.provider";
import { RefreshSessionService } from "@/user/application/services/session/refresh-session.service";
import { SessionIssuer } from "@/user/application/services/session/session-issuer.service";
import { authConfig } from "@/user/infrastructure/config/auth.config";
import { OauthConfig } from "@/user/infrastructure/config/oauth.config";
import { PermissionController } from "@/user/infrastructure/http/admin/permission.controller";
import { RoleController } from "@/user/infrastructure/http/admin/role.controller";
import { AuthController } from "@/user/infrastructure/http/customer/auth.controller";
import { AuthGuard } from "@/user/infrastructure/http/guards/auth.guard";
import { PermissionGuard } from "@/user/infrastructure/http/guards/permission.guard";
import {PermissionService} from "@/user/infrastructure/service/permission.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, Role, Permission]),
    ConfigModule.forFeature(OauthConfig),
    ConfigModule.forFeature(authConfig),
  ],
  controllers: [AuthController, RoleController, PermissionController],
  providers: [
    AuthConfigReader,
    SessionIssuer,
    RefreshSessionService,
    RefreshSessionAction,
    UserMailService,
    HasherService,
    TokenHasher,
    FindAllUsersAction,
    CreateUserAction,
    UpdateUserAction,
    DeleteUserAction,
    LoginByMailAction,
    ForgotPasswordAction,
    FrontendLinkBuilder,
    ResetPasswordAction,
    VerifycationEmailAction,
    OauthRegisterProvider,
    GoogleOauthProvider,
    GithubOauthProvider,
    LinkedinOauthProvider,
    ConfigReader,
    ConfirmOauthAction,
    UnnauthorizedResetAction,
    CreateRoleAction,
    FindAllRoleAction,
    DeleteRoleAction,
    UpdateRoleAction,
    AuthGuard,
    FindAllPermissionAction,
    PermissionGuard,
    PermissionService,

    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: SessionRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PermissionRepository,
    },
  ],
})
export class UserModule {}
