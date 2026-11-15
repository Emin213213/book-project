import { Controller, Get, Header, Req, UseGuards } from "@nestjs/common";

import type { AuthContext } from "@/common/application/auth/auth-context";
import { AuthGuard } from "@/user/infrastructure/http/guards/auth.guard";

type AccessRequest = { readonly auth: AuthContext };

/** Возвращает разрешения текущей сессии из того же контекста, что использует PermissionGuard. */
@Controller("auth/permissions")
@UseGuards(AuthGuard)
export class CurrentAccessController {
  @Get()
  @Header("Cache-Control", "private, no-store")
  public getPermissions(@Req() request: AccessRequest): {
    readonly permissions: readonly string[];
  } {
    return { permissions: [...(request.auth.permissions ?? [])] };
  }
}
