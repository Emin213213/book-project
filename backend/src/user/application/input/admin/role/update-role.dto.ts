import { PartialType } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsString, ValidateIf } from "class-validator";

import { CreateRoleDto } from "./create-role.dto";

/** Проверяет частичное обновление роли; пустой список снимает все разрешения. */
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ValidateIf((_input: unknown, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  public readonly permissions?: readonly string[];
}
