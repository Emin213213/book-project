import {
    Body,
    Controller,
    Get,
    Inject, Param, Patch,
    Post,
    Query, UploadedFile, UseInterceptors,
} from "@nestjs/common";
import {ListAllDTO} from "@/book/application/dto/authors/list-all.dto";
import {Author} from "@/book/domain/entities/author.entity";
import {AuthorResource} from "@/book/infrastructure/http/admin/resources/author.resouces";
import {ListAllAuthorsAction} from "@/book/application/actions/authors/list-all-authors.action";
import {
    AuthorPaginatedResource
} from "@/book/infrastructure/http/admin/resources/collections/author-paginated.resource";
import {CreateAuthorAction} from "@/book/application/actions/authors/create-author.action";
import {CreateAuthorDto} from "@/book/application/dto/authors/create-author.dto";
import {AuthorAlreadyExistsException} from "@/book/domain/exceptions/author-already-exists.exception";
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import {UpdateAuthorDto} from "@/book/application/dto/authors/update-author.dto";
import {AuthorsRepository} from "@/book/infrastructure/repository/authors.repository";
import {ResourceNotExistsException} from "@/common/domain/exceptions/resource-not-exists.exception";
import {UpdateAuthorAction} from "@/book/application/actions/authors/update-author.action";
import {AuthorAvatarStorage} from "@/book/application/service/author-avatar.storage";
import {FileInterceptor} from "@nestjs/platform-express";


@Controller('/admin/authors')
@ApiTags("Authors")
/** Handles author-management requests in the admin HTTP API. */
export class AuthorController {

    constructor(
        @Inject() private readonly listAuthorAction: ListAllAuthorsAction,
        @Inject() private readonly createAuthorAction: CreateAuthorAction,
        @Inject() private readonly updateAuthorAction: UpdateAuthorAction,
        @Inject() private readonly authorRepository: AuthorsRepository,
        @Inject() private readonly authorAvatarStorage: AuthorAvatarStorage,
    ) {
    }

    @Get()
    @ApiOperation({
        operationId: "admin.book.author.listAll",
        summary: "List authors",
        description: `Returns one page of authors together with pagination metadata.

The query parameters control which page is returned. For example:

\`\`\`http
GET /admin/authors?page=1&per_page=25
\`\`\`

An equivalent JavaScript request:

\`\`\`js
const response = await fetch("/admin/authors?page=1&per_page=25");
const authors = await response.json();
\`\`\`

The response contains the authors in \`data\` and pagination information in \`meta\`.`,
    })
    @ApiQuery({
        name: "page",
        description: "Page number to return. Numbering starts at 1.",
        example: 1,
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: "per_page",
        description: "Maximum number of authors per page. The minimum accepted value is 5.",
        example: 25,
        required: false,
        type: Number,
    })
    @ApiOkResponse({
        description: "The paginated author collection was returned successfully.",
        type: AuthorPaginatedResource,
    })

    public async listAll(@Query() context: ListAllDTO) {
        const [data, total] = await this.listAuthorAction.handle(context)
        return AuthorPaginatedResource.make(data, total, this.authorAvatarStorage, context.page, context.per_page)
    }


    @Post('/create')
    @ApiOperation({
        operationId: "admin.book.author.create",
        summary: "Create an author",
        description: `Validates the request body and persists a new author.

All fields except \`avatar\` are required. The date string is converted to a JavaScript
\`Date\` before validation.

The controller passes the validated DTO to \`CreateAuthorAction\`. The current endpoint responds
with HTTP 201 after persistence and does not return the created author in the response body.`,
    })
    @ApiCreatedResponse({
        description: "The author was created successfully. The response body is empty.",
    })
    @ApiBadRequestResponse({
        description: `The request failed DTO validation or violated a business rule.

Examples include an empty name, an invalid avatar URL, or a date that cannot be converted to a
valid \`Date\`.`,
    })
    @UseInterceptors(FileInterceptor('avatar'))

    public async create(@Body() context: CreateAuthorDto, @UploadedFile() avatar: Express.Multer.File) {
        context.withAvatar(avatar)
        const author = await this.createAuthorAction.handle(context);

        return AuthorResource.make(author, this.authorAvatarStorage)

    }

    @Patch(':slug')
    public async update(
        @Body() context: UpdateAuthorDto,
        @Param("slug") slug: string
    ) {

        const author = await this.authorRepository.findBySlug(slug)

        if (!author) {
            throw new ResourceNotExistsException('Author not found')
        }

        const updateAuthor = await this.updateAuthorAction.handle(author, context)

        return AuthorResource.make(updateAuthor, this.authorAvatarStorage)
    }

}
