import { Inject, Injectable } from "@nestjs/common";

import type { RequestContext } from "@/user/application/input/request-context";
import { RefreshSessionService } from "@/user/application/services/session/refresh-session.service";
import { TokenHasher } from "@/user/application/services/token.hasher";
import type { ISessionRepository } from "@/user/domain/repositories/session.repository.interface";
import { SESSION_REPOSITORY } from "@/user/domain/repositories/session.repository.interface";
import type { IssuedTokens } from "@/user/domain/value-objects/issued-tokens";
import { InvalidSessionException } from "@/user/infrastructure/http/exceptions/invalid-session.exception";
import {RefreshTokenDto} from "@/user/application/input/session/refresh-token.dto";

/** Обновляет токены сессии и отзывает её при повторном использовании refresh. */
@Injectable()
export class RefreshSessionAction {
  constructor(
     @Inject(SESSION_REPOSITORY) private readonly sessionRepository: ISessionRepository,
     private readonly tokenHasher: TokenHasher,
     private readonly refreshSessionService: RefreshSessionService,
  ) {}

  public async handle(request: RequestContext, context:RefreshTokenDto): Promise<IssuedTokens> {
    const hash = this.tokenHasher.hash(context.refreshToken);

      const result = await this.sessionRepository.withLockedRefreshSession(
        hash,
        (session, repository) => this.refreshSessionService.refresh(session, repository, hash, request),
      );

    if (!result.ok) {
      throw new InvalidSessionException();
    }

    return result.tokens;
  }
}
