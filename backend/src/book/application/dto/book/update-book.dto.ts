import { PartialType } from '@nestjs/swagger';

import { CreateBookDto } from './create-book.dto';

/**
 * Частичное обновление книги.
 *
 * Наследуется от `CreateBookDto`, как `UpdateAuthorDto` и `UpdateCategoryDto`:
 * поля и их валидация не дублируются.
 *
 * Поле `cover` намеренно не исключается: оно нужно, чтобы Swagger отрисовал
 * поле загрузки файла в форме PATCH. Сам файл приходит через
 * `FileInterceptor` и передаётся в экшен отдельным аргументом — значение из
 * тела не читается.
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}
