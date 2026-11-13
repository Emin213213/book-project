import {CanActivate, Inject} from "@nestjs/common";
import {ExecutionContext} from "@nestjs/common/interfaces/features/execution-context.interface";
import {MissingBearerTokenException} from "../exceptions/missing-bearer-token.exception";
import {InvalidSessionException} from "../exceptions/invalid-session.exception";
import {TokenHasher} from "@/user/application/services/token.hasher";
import {ISessionRepository, SESSION_REPOSITORY} from "@/user/domain/repositories/session.repository.interface";
import {AuthContext} from "@/common/application/auth/auth-context";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
import {AuthUser} from "@/common/application/auth/auth-user";


export class AuthGuard implements CanActivate {

    constructor(
        @Inject() private readonly tokenHasher: TokenHasher,
        @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository
    ) {}

    private static HEADER_PREFIX = 'bearer'

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();


        const header = request.headers['authorization']

        const token = this.extractBearer(header);

        if (!token) {
            throw new MissingBearerTokenException()

        }
        const tokenHash = this.tokenHasher.hash(token);
        const session = await this.sessionRepository.findActiveByAccessTokenHash(tokenHash);

        if (!session) {
            throw new InvalidSessionException()
        }

        const user = new AuthUser(Uuid.fromString(session.user.id),session.user.email)


        const permissions = new Set(
            session.user.role.flatMap(role => role.permissions.map(permission => permission.getSlug()))
        )

        request.auth = new AuthContext(
            user,
            session.id.toString(),
            permissions,
        );

        return true

    }


    private extractBearer(header: string): string | null {
        if (!header) {
            return null
        }
        const [schema, value] = header.split(' ')


        return schema.toLowerCase() === AuthGuard.HEADER_PREFIX && value ? value : null

    }
}
