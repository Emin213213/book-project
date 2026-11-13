import {TokenHasher} from "@/user/application/services/token.hasher";
import {Session} from "@/user/domain/entities/session.entity";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
import {ISessionRepository, SESSION_REPOSITORY} from "@/user/domain/repositories/session.repository.interface";
import {User} from "@/user/domain/entities/user.entity";
import {Inject, Injectable} from "@nestjs/common";
import {AuthConfigReader} from "@/user/application/services/auth-config.reader";
import {IssuedTokens} from "@/user/domain/value-objects/issued-tokens";
import type { RequestContext } from "@/user/application/input/request-context";


@Injectable()
export class SessionIssuer {
    constructor(
        @Inject(SESSION_REPOSITORY) private readonly sessions: ISessionRepository,
        @Inject() private readonly tokenHasher: TokenHasher,
        @Inject() private readonly config: AuthConfigReader,
    ) {}

    public async issue(user: User, requestContext: RequestContext, rememberMe: boolean = false ): Promise<IssuedTokens> {
        const accessToken = this.tokenHasher.generate();

        const  refreshToken  = this.tokenHasher.generate()

        const expiresAt = Session.resolveTokenLifetime(
            this.config.accessTokenTtlMs(),
        );

        const refreshExpiresAt = Session.resolveTokenLifetime(
            this.config.refreshTokenTtlMs(rememberMe)
        )

        const session = Session.create(
            Uuid.generate(),
            user,
            this.tokenHasher.hash(accessToken),
           expiresAt
        );

        session.initializeRefreshToken(
            this.tokenHasher.hash(refreshToken),
            refreshExpiresAt,
        )

        session.rememberClient(requestContext.ip, requestContext.userAgent ?? null);

        session.setRememberMe(rememberMe);
        await this.sessions.save(session);

        return new IssuedTokens(accessToken, session,refreshToken);
    }



    /** Заменяет токены и сохраняет сессию через репозиторий вызывающей транзакции. */
    public async rotate(
        session: Session,
        request: RequestContext,
        repository: ISessionRepository,
    ): Promise<IssuedTokens> {
        const refreshToken = this.tokenHasher.generate();
        const accessToken = this.tokenHasher.generate();

        const accessExpiresAt = Session.resolveTokenLifetime(this.config.accessTokenTtlMs());

        session.rotateRefreshToken(this.tokenHasher.hash(refreshToken));

        session.renewAccessToken(this.tokenHasher.hash(accessToken), accessExpiresAt);
        session.rememberClient(request.ip, request.userAgent ?? null);

        await repository.save(session);
        return new IssuedTokens(accessToken, session, refreshToken);
    }
}
