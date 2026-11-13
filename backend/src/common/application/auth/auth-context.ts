
import {AuthUser} from "@/common/application/auth/auth-user";

export class AuthContext {
    constructor(
        public readonly user: AuthUser,
        public readonly sessionId?: string,
        public readonly permissions?: Set<string>,
    ) {}
}