import {Body, Controller, Delete, Get, HttpCode, Inject, Injectable, Param, Patch, Post, Query} from "@nestjs/common";
import {CreateCategoryDto} from "@/book/application/dto/category/create-category.dto";
import {CreateCategoryAction} from "@/book/application/actions/category/create-category.action";
import {CategoryResource} from "@/book/infrastructure/http/admin/resources/category.resource";
import {
    ApiBadRequestResponse, ApiBody,
    ApiCreatedResponse,
    ApiHeader, ApiNoContentResponse, ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags, ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {Locale} from "@/book/domain/enum/locale.enum";
import {ListAllCategoriesAction} from "@/book/application/actions/category/list-all-categories.action";
import {ListAllDto} from "@/book/application/dto/category/list-all.dto";
import {
    CategoryPaginatedResource
} from "@/book/infrastructure/http/admin/resources/collections/category-paginated.resource";
import {UpdateCategoryDto} from "@/book/application/dto/category/update-category.dto";
import {UpdateCategoryAction} from "@/book/application/actions/category/update-category.action";
import {DeleteCategoryAction} from "@/book/application/actions/category/delete-category.action";

@Injectable()
@Controller('/admin/categories')
@ApiTags("Categories")

export class CategoryController {
    constructor(
        @Inject() private readonly createCategoryAction: CreateCategoryAction,
        @Inject() private readonly listAllCategoryAction: ListAllCategoriesAction,
        @Inject() private readonly updateCategoryAction: UpdateCategoryAction,
        @Inject() private readonly deleteCategoryAction: DeleteCategoryAction
    ) {
    }


    @Get()
    @ApiParam({
        name: 'slug',
        description: 'Unique readable Uri'
    })
    @ApiOkResponse({
        type: CategoryPaginatedResource
    })
    @ApiHeader({
        name: 'Accept-Locale',
        description: 'Set locale',
        example: 'ua',
        schema: {
            type: 'string',
            enum: Object.values(Locale)
        }
    })
    @ApiQuery({
        name: "page",
        type: 'number',
        required: true,
        description: " Number of the page",
        example: 1
    })
    @ApiOperation({
        operationId: 'admin.book.category.listAll',
        description: `<small>

<!-- theme: info -->
> ## Automatic Redirect Creation for Slug Changes
>
> When updating brand slug, redirects are created automatically based on brand status:
>
> | Brand Status | Redirect Behavior |
> |-------------|------------------|
> | PUBLISHED | Creates redirect: \`old-slug → new-slug\` (all locales) |
> | DRAFT/ARCHIVED | No redirect created |

<!-- theme: warning -->
> Note: To change brand status, use the dedicated \`/status\` endpoint instead.

<!-- theme: info -->
> ## Translation Support
>
> This endpoint supports translations. Use the \`locale\` parameter to update specific locale, or pass translatable fields as objects with locale keys for multiple translations.

</small>`,
        summary: 'List All'
    })
    @Get()
    @HttpCode(200)
    public async listAll(@Query() context: ListAllDto) {
        const [data, total] = await this.listAllCategoryAction.handle(context)
        return CategoryPaginatedResource.make(data, total, context.page, context.per_page)
    }


    @Post()
    @HttpCode(201)
    @ApiBadRequestResponse({
        description: `<small>

<!-- theme: danger -->
> ## Error Response
>
> The request could not be processed because the submitted data violates one or more business rules.
>
> - **HTTP Status:** \`400 Bad Request\`
> - Returns the application error code.
> - Returns a human-readable error message.
>
> ## Example
>
> **Request**
>
> \`\`\`http
> POST http://localhost:8000/api/v1/book/admin/categories
> \`\`\`
>
> \`\`\`json
> {
>   "title": "HELLO WOfefwefeRLfewD",
>   "slug": "132131232111H1ELLO WOfewfweffewwfRLdddD"
> }
> \`\`\`
>
> **Response — 400 Bad Request**
>
> \`\`\`json
> {
>   "statusCode": 400,
>   "errorCode": "BOOK_ALREADY_EXIST",
>   "message": "Book already exist"
> }
> \`\`\`

</small>`
    })
    @ApiCreatedResponse({
        description: `<small>

<!-- theme: info -->
> ## Success Response
>
> The request was processed successfully.
>
> - **HTTP Status:** \`200 OK\`
> - Returns the created category object.
> - Includes the generated **UUID**.
> - Includes the creation and last update timestamps.
>
> ## Example
>
> **Request**
>
> \`\`\`http
> POST http://localhost:8000/api/v1/book/admin/categories
> \`\`\`
>
> \`\`\`json
> {
>   "title": "HELLO WOfefeRLD",
>   "slug": "132131232111H1ELLO WOfewfwefewfRLdddD"
> }
> \`\`\`
>
> **Response — 200 OK**
>
> \`\`\`json
> {
>   "id": "81710a04-1a71-0f7f-f346-492fce342498",
>   "title": "HELLO WOfefeRLD",
>   "slug": "132131232111h1ello-wofewfwefewfrldddd",
>   "createdAt": "2026-07-28T09:53:53.268Z",
>   "updatedAt": "2026-07-28T09:53:53.268Z"
> }
> \`\`\`

</small>`
    })
    @ApiOperation({
        summary: 'Category - create',
        operationId:'category.book.create',
        description: `
<small>

<!-- theme: info -->
> ##  Description
>
> Creates a new book category.
> The category title and slug must be unique.
> If the request is valid, a new category is stored and returned.

<!-- theme: info -->
> ##  Business Rules
>
> - A category with the same title cannot already exist.
> - A category with the same slug cannot already exist.
> - The slug is normalized before being saved.
> - Both title and slug are required.

</small>
`
    })
    @ApiParam({
        name:'Create',
        type:CreateCategoryDto,

    })
    public async create(
        @Body() context: CreateCategoryDto
    ) {
        const category = await this.createCategoryAction.handle(context)
        console.log(category)
        return CategoryResource.make(category)
    }


    @Patch(':slug')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Category - update',
        operationId: 'category.book.update',
        description: `<small>

<!-- theme: info -->
> ## Update Behavior
>
> This endpoint performs a partial update.
> Only the fields included in the request body are modified.
> Existing values remain unchanged if a field is omitted.
>
> | Request Data | Result |
> |-------------|--------|
> | Field provided | Value is updated |
> | Field omitted | Existing value is preserved |
> | Invalid value | Validation error (400) |

<!-- theme:  info -->
> ## Business Rules
>
> - The category must exist.
> - Only the fields included in the request are updated.
> - Fields omitted from the request remain unchanged.
> - The updated slug must be unique across all categories.


<!-- theme: warning -->
> ## Permissions
>
> - Authentication is required.
> - Only users with permission to manage categories can update a category.
> - Unauthorized users receive **401 Unauthorized**.
> - Users without sufficient permissions receive **403 Forbidden**.


<!-- theme: warning -->
> ## Validation Rules
>
> - The category **slug** parameter is required.
> - The request body must contain valid data.
> - The **slug** must be unique if it is updated.
> - String fields cannot be empty.
> - Validation errors return **400 Bad Request**.

<!-- theme: info -->
> ## Examples
>
> **Request**
>
> \`\`\`json
> PATCH http://localhost:8000/api/v1/book/admin/categories/{slug}
>
> {
>   "slug": "science-fiction-fantasy"
> }
> \`\`\`

</small>`,
    })
    @ApiParam({
        name: "slug",
        type: String,
        required: true,
        example: "science-fiction",
        description: "Unique slug of the category to update.",
    })
    @ApiOkResponse({
        description: 'The category was updated successfully and the latest version has been returned.',
        type: UpdateCategoryDto

    })
    @ApiBadRequestResponse({
        description: `
        
> ## Example
>
> The following example demonstrates a request that references a category that does not exist.
> In this case, the API returns a **400 Bad Request** response with the corresponding error code.
>
> **Request**
>
> \`\`\`http
> PATCH /api/v1/book/admin/categories/{slug}
> Content-Type: application/json
>
> {
>   "slug": "new-category"
> }
> \`\`\`
>
> **Response**
>
> \`\`\`json
> {
>   "statusCode": 400,
>   "errorCode": "CATEGORY_NOT_EXIST",
>   "message": "Category not exist"
> }
> \`\`\``
    })
    @ApiNotFoundResponse({
        description: `
> ## Example
>
> The requested endpoint does not exist or the URL is incorrect.
> Verify that the request path and HTTP method are correct before sending the request.
>
> **Request**
>
> \`\`\`http
> PATCH /api/v1/book/admin/categories/
> \`\`\`
>
> **Response**
>
> \`\`\`json
> {
>   "statusCode": 404,
>   "error": "Not Found",
>   "message": "Cannot PATCH /api/v1/book/admin/categories/"
> }
> \`\`\`
`
    })
    public async update(
        @Param('slug') slug: string,
        @Body() context: UpdateCategoryDto
    ) {
        const category = await this.updateCategoryAction.handle(context, slug)

    }

    @Delete(":slug")
    @HttpCode(204)
    @ApiParam({
        name: "slug",
        type: String,
        required: true,
        example: "science-fiction",
        description: "Unique slug of the category to update.",
    })
    @ApiOperation({
        summary: 'Category - delete',
        operationId: 'category.book.delete',
        description: `
<small>

<!-- theme: info -->
> ##  Description
>
> Deletes an existing category by its unique slug.
> Once deleted, the category can no longer be retrieved or updated.

<!-- theme: info -->
> ##  Business Rules
>
> - The category must exist.
> - The category is permanently removed from the system.
> - A deleted category cannot be restored.

<!-- theme: info -->
> ##  Permissions
>
> - Only authenticated administrators are allowed to delete categories.

<!-- theme: info -->
> ##  Success Response
>
> If the category is successfully deleted, the API returns:
>
> - **HTTP Status:** \`204 No Content\`
> - The response body is empty.

</small>
`
    })
    @ApiNoContentResponse({
        description: `<small>

<!-- theme: info -->
> ## Success Response
>
> The category was successfully deleted.
>
> - **HTTP Status:** \`204 No Content\`
> - The response body is empty.
>
> ## Example
>
> **Request**
>
> \`\`\`http
> DELETE http://localhost:8000/api/v1/book/admin/categories/programming
> \`\`\`
>
> **Response — 204 No Content**
>
> The response body is empty.

</small>`
    })
    @ApiBadRequestResponse({
        description: `<small>

<!-- theme: danger -->
> ## Error Response
>
> The request could not be completed because the specified category does not exist.
>
> - **HTTP Status:** \`400 Bad Request\`
> - Returns the application error code.
> - Returns a human-readable error message.
>
> ## Example
>
> **Request**
>
> \`\`\`http
> DELETE http://localhost:8000/api/v1/book/admin/categories/non-existing-category
> \`\`\`
>
> **Response — 400 Bad Request**
>
> \`\`\`json
> {
>   "statusCode": 400,
>   "errorCode": "CATEGORY_NOT_EXIST",
>   "message": "Category not exist"
> }
> \`\`\`

</small>`
    })
    public async delete(
        @Param('slug') slug: string,
    ) {
        await this.deleteCategoryAction.handle(slug)
    }

}