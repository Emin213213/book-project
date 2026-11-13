import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

/** Параметры поиска и пагинации списка ролей. */
export class FindAllRolesDto {
  @IsOptional()
  @IsString()
  public readonly role?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly per_page: number = 25;
}
