import { Uuid } from "@/common/domain/value-objects/uuid.vo";
import { OauthProviderEnum } from "@/user/domain/enum/oauth-provider.enum";
import { Email } from "@/user/domain/value-objects/email.vo";

/** Данные OAuth-аккаунта и локальный UUID для создания пользователя магазина. */
export class NetworkUser {
  public readonly id: Uuid = Uuid.generate();

  constructor(
    public readonly identity: string,
    public readonly email: Email,
    public readonly provider: OauthProviderEnum,
    public readonly connectedAt: Date,
    public readonly cover?: string,
  ) {}
}
