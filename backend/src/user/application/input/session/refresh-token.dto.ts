import { IsNotEmpty, IsString } from "class-validator";

/** Запрос обновления пары токенов. */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken!: string;
}
