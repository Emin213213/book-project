import { IsOptional, IsString } from "class-validator";

/** Параметры поиска списка ролей. */
export class FindAllRolesDto {
  @IsOptional()
  @IsString()
  public readonly role?: string;
}
