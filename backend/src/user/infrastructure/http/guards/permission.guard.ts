import type {CanActivate, ExecutionContext} from '@nestjs/common';
import {Injectable} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import type {Request} from 'express';

import type {AuthContext} from '@/common/application/auth/auth-context';
import {REQUIRED_PERMISSIONS} from "@/user/infrastructure/decorators/required-permission.decorator";
import { ForbiddenException } from '@/user/infrastructure/http/exceptions/forbidden.exception';

type PermissionRequest = Omit<Request, "auth"> & { auth?: AuthContext };

/** Проверяет наличие всех прав, требуемых обработчиком или контроллером. */
@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<PermissionRequest>();

        const userPermissions = request.auth?.permissions;

        const requiredPermissions = this.reflector.getAllAndOverride(REQUIRED_PERMISSIONS, [
            context.getHandler(),
            context.getClass(),
        ]) ?? [];

        const hasAllPermissions = requiredPermissions.every(
            (permission) => userPermissions?.has(permission) === true,
        );

        if (!hasAllPermissions) {
          throw new ForbiddenException();
        }

        return true;
    }
}
