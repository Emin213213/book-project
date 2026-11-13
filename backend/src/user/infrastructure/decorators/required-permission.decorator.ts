import {Reflector} from "@nestjs/core";
import type { PermissionType } from "@/common/domain/permission.type";


export const REQUIRED_PERMISSIONS =
    Reflector.createDecorator<readonly PermissionType[]>();