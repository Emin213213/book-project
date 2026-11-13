import { ApiProperty } from '@nestjs/swagger';

/** Тело ответа при доменной ошибке или отсутствии ресурса. */
export class DomainErrorResource {
  @ApiProperty({
    description: 'HTTP-статус ответа.',
    example: 400,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    description:
      'Стабильный код ошибки приложения. Ветвитесь по нему, а не по тексту сообщения.',
    example: 'BOOK_ISBN_ALREADY_EXISTS',
  })
  errorCode: string;

  @ApiProperty({
    description: 'Человекочитаемое описание ошибки.',
    example: 'Book with this ISBN already exists',
  })
  message: string;
}
