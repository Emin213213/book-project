import { Injectable } from "@nestjs/common";

import type { RequestContext } from "@/user/application/input/request-context";
import { SessionIssuer } from "@/user/application/services/session/session-issuer.service";
import type { Session } from "@/user/domain/entities/session.entity";
import type { ISessionRepository } from "@/user/domain/repositories/session.repository.interface";
import type { IssuedTokens } from "@/user/domain/value-objects/issued-tokens";

/** Результат ротации с причиной отказа для обработки в вызывающем экшене. */
export type RefreshResult =
  | { readonly ok: true; readonly tokens: IssuedTokens }
  | { readonly ok: false; readonly reason: "invalid" | "token_reuse" };

@Injectable()
export class RefreshSessionService {
  constructor(private readonly sessionIssuer: SessionIssuer) {}

  /** Выполняет обновление через репозиторий текущей транзакции. */
  public async refresh(
    session: Session | undefined,
    sessionRepository: ISessionRepository,
    hash: string,
    request: RequestContext,
  ): Promise<RefreshResult> {
    if (!session) {
      return { ok: false, reason: "invalid" };
    }

    if (session.refreshTokenHash !== hash) {
      await sessionRepository.revoke(session.id, "token_reuse");
      return { ok: false, reason: "token_reuse" };
    }

    if (!session.canRefresh(new Date())) {
      return { ok: false, reason: "invalid" };
    }

    const tokens = await this.sessionIssuer.rotate(session, request, sessionRepository);
    return { ok: true, tokens };
  }
}
