import type { IssuedTokens } from "@/user/domain/value-objects/issued-tokens";

/** Новая пара токенов и срок действия access-токена. */
export class TokenPairResource {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresAt: string,
  ) {}

  /** Формирует HTTP-ответ без внутренних данных сессии. */
  static make(tokens: IssuedTokens): TokenPairResource {
    return new TokenPairResource(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresAt.toISOString(),
    );
  }
}
