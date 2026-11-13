import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@/common/application/dto/pagination-query.dto';

/** Параметры выборки списка книг. */
export class ListBooksDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Фильтр по части названия.',
    example: '1984',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по slug автора.',
    example: 'george-orwell',
  })
  @IsOptional()
  @IsString()
  authorSlug?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по slug категории.',
    example: 'dystopian-fiction',
  })
  @IsOptional()
  @IsString()
  categorySlug?: string;
}
