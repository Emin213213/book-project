import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Inject,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    Query,
    MaxFileSizeValidator,
    FileTypeValidator,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import {CreateBookAction} from '../../../application/actions/book/create-book.action';
import {DeleteBookAction} from '../../../application/actions/book/delete-book.action';
import {FindAllBooksAction} from '../../../application/actions/book/find-all-books.action';
import {UpdateBookAction} from '../../../application/actions/book/update-book.action';
import {AuthorAvatarStorage} from '@/book/application/service/author-avatar.storage';
import {BookCoverStorage} from '@/book/application/service/book-cover.storage';
import {CreateBookDto} from '../../../application/dto/book/create-book.dto';
import {ListBooksDto} from '../../../application/dto/book/list-books.dto';
import {UpdateBookDto} from '../../../application/dto/book/update-book.dto';
import {
    BOOK_REPOSITORY,
    type IBookRepository,
} from '@/book/domain/repositories/book.repository.interface';
import {ErrorCode} from '../../../domain/exceptions/error-code.enum';
import {ResourceNotExistsException} from '@/common/domain/exceptions/resource-not-exists.exception';
import {DomainErrorResource} from '@/common/infrastructure/http/resources/domain-error.resource';
import {ValidationErrorResource} from '@/common/infrastructure/http/resources/validation-error.resource';
import {BookResource} from './resources/book.resource';
import {BookPaginatedResource} from './resources/collections/book-paginated.resource';
import {
    CREATE_BOOK_DESCRIPTION,
    DELETE_BOOK_DESCRIPTION,
    LIST_BOOKS_DESCRIPTION,
    SHOW_BOOK_DESCRIPTION,
    UPDATE_BOOK_DESCRIPTION,
} from './book.api-docs';

const COVER_MAX_BYTES = 5 * 1024 * 1024;

@Controller('/admin/books')
@ApiTags('Books')
/** Обслуживает управление книгами в админском HTTP API. */
export class BookController {
    constructor(
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: IBookRepository,
        private readonly findAllBooks: FindAllBooksAction,
        private readonly createBook: CreateBookAction,
        private readonly updateBook: UpdateBookAction,
        private readonly deleteBook: DeleteBookAction,
        private readonly bookCoverStorage: BookCoverStorage,
        private readonly authorAvatarStorage: AuthorAvatarStorage,
    ) {
    }

    @Get()
    @HttpCode(200)
    @ApiOperation({
        operationId: 'admin.book.listAll',
        summary: 'Список книг',
        description: LIST_BOOKS_DESCRIPTION,
    })
    @ApiQuery({name: 'title', required: false, type: String, example: '1984'})
    @ApiQuery({name: 'authorSlug', required: false, type: String, example: 'george-orwell'})
    @ApiQuery({name: 'categorySlug', required: false, type: String, example: 'dystopian-fiction'})
    @ApiQuery({name: 'page', required: false, type: Number, example: 1})
    @ApiQuery({name: 'per_page', required: false, type: Number, example: 15})
    @ApiOkResponse({
        description: 'Страница книг вместе с метаданными пагинации.',
        type: BookPaginatedResource,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Параметры запроса не прошли валидацию.',
        type: ValidationErrorResource,
    })
    async findAll(@Query() context: ListBooksDto) {
        const [data, total] = await this.findAllBooks.handle(context);

        return BookPaginatedResource.make(
            data,
            total,
            context.page ?? 1,
            context.per_page ?? 15,
            this.bookCoverStorage,
            this.authorAvatarStorage,
        );
    }

    @Get(':slug')
    @HttpCode(200)
    @ApiOperation({
        operationId: 'admin.book.show',
        summary: 'Книга по slug',
        description: SHOW_BOOK_DESCRIPTION,
    })
    @ApiParam({name: 'slug', type: String, required: true, example: '1984'})
    @ApiOkResponse({description: 'Книга найдена.', type: BookResource})
    @ApiNotFoundResponse({description: 'Книга не найдена.', type: DomainErrorResource})
    async findBySlug(@Param('slug') slug: string) {
        const book = await this.bookRepository.findBySlug(slug);

        if (!book) {
            throw new ResourceNotExistsException('Book not found', ErrorCode.NOT_FOUND);
        }

        return BookResource.make(book, this.bookCoverStorage, this.authorAvatarStorage);
    }

    @Post()
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('cover'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: CreateBookDto})
    @ApiOperation({
        operationId: 'admin.book.create',
        summary: 'Создать книгу',
        description: CREATE_BOOK_DESCRIPTION,
    })
    @ApiCreatedResponse({description: 'Книга создана.', type: BookResource})
    @ApiBadRequestResponse({
        description: 'Нарушено бизнес-правило.',
        type: DomainErrorResource,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Тело запроса не прошло валидацию.',
        type: ValidationErrorResource,
    })
    async create(
        @Body() context: CreateBookDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({maxSize: COVER_MAX_BYTES}),
                    new FileTypeValidator({fileType: /^image\/(jpeg|png|webp)$/}),
                ],
            }),
        )
        cover?: Express.Multer.File,
    ) {
        context.withCover(cover);

        const book = await this.createBook.handle(context);

        return BookResource.make(book, this.bookCoverStorage, this.authorAvatarStorage);
    }

    @Patch(':slug')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('cover'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: UpdateBookDto})
    @ApiOperation({
        operationId: 'admin.book.update',
        summary: 'Обновить книгу',
        description: UPDATE_BOOK_DESCRIPTION,
    })
    @ApiParam({name: 'slug', type: String, required: true, example: '1984'})
    @ApiOkResponse({description: 'Книга обновлена.', type: BookResource})
    @ApiBadRequestResponse({
        description: 'Нарушено бизнес-правило.',
        type: DomainErrorResource,
    })
    @ApiNotFoundResponse({description: 'Книга не найдена.', type: DomainErrorResource})
    @ApiUnprocessableEntityResponse({
        description: 'Тело запроса не прошло валидацию.',
        type: ValidationErrorResource,
    })
    async update(
        @Param('slug') slug: string,
        @Body() context: UpdateBookDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({maxSize: COVER_MAX_BYTES}),
                    new FileTypeValidator({fileType: /^image\/(jpeg|png|webp)$/}),
                ],
            }),
        )
        cover?: Express.Multer.File,
    ) {
        const book = await this.bookRepository.findBySlug(slug);

        if (!book) {
            throw new ResourceNotExistsException('Book not found', ErrorCode.NOT_FOUND);
        }

        const updated = await this.updateBook.handle(book, context, cover);

        return BookResource.make(updated, this.bookCoverStorage, this.authorAvatarStorage);
    }

    @Delete(':slug')
    @HttpCode(204)
    @ApiOperation({
        operationId: 'admin.book.delete',
        summary: 'Удалить книгу',
        description: DELETE_BOOK_DESCRIPTION,
    })
    @ApiParam({name: 'slug', type: String, required: true, example: '1984'})
    @ApiNoContentResponse({description: 'Книга удалена, тело ответа пустое.'})
    @ApiNotFoundResponse({description: 'Книга не найдена.', type: DomainErrorResource})
    async remove(@Param('slug') slug: string) {
        const book = await this.bookRepository.findBySlug(slug);

        if (!book) {
            throw new ResourceNotExistsException('Book not found', ErrorCode.NOT_FOUND);
        }

        await this.deleteBook.handle(book);
    }
}
