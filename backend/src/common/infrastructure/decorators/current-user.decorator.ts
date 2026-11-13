import {ExecutionContext} from "@nestjs/common/interfaces/features/execution-context.interface";
import {createParamDecorator} from "@nestjs/common";
import {AuthContext} from "@/common/application/auth/auth-context";
import {UnauthenticatedException} from "@/common/domain/exceptions/unauthenticated.exception";

export const CurrentUser = createParamDecorator(
    (_: unknown, context: ExecutionContext):AuthContext=> {
        const request = context.switchToHttp().getRequest();
        if (!request.auth) {
            throw new UnauthenticatedException();
        }
        return request.auth;
    },
);
