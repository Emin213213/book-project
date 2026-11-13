import type { User } from "@/user/domain/entities/user.entity";
import { UserResource } from "@/user/infrastructure/http/customer/resources/user.resource";

/** Ответ авторизации с парой токенов и профилем пользователя. */
export class AuthResource {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly expiresAt: string,
    public readonly user: UserResource,
  ) {}

  /** Формирует ответ авторизации из результата выдачи токенов. */
  static make(
    user: User,
    tokens: { readonly accessToken: string; readonly refreshToken: string; readonly expiresAt: Date },
  ): AuthResource {
    return new AuthResource(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresAt.toISOString(),
      UserResource.make(user),
    );
  }
}
