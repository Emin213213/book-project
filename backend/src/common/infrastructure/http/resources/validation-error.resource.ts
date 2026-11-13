import { ApiProperty } from '@nestjs/swagger';

/** Тело ответа при непройденной валидации DTO. */
export class ValidationErrorResource {
  @ApiProperty({
    description: 'Постоянный текст для ошибок валидации.',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    additionalProperties: { items: { type: 'string' }, type: 'array' },
    description: 'Нарушенные правила, сгруппированные по имени поля.',
    example: { authorIds: ['each value in authorIds must be a UUID'] },
    type: 'object',
  })
  errors: Record<string, string[]>;
}
