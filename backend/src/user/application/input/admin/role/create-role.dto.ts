import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

const MAX_ROLE_NAME_LENGTH = 100;
const MAX_ROLE_SLUG_LENGTH = 255;

/** Проверяет входные данные создания роли. */
export class CreateRoleDto {
  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ROLE_NAME_LENGTH)
  public readonly name: string;

  @Transform(({ value }: { value: unknown }): unknown =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ROLE_SLUG_LENGTH)
  public readonly slug: string;
}
