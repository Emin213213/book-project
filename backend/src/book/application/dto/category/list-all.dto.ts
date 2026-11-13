import {Type} from "class-transformer";
import {IsInt, Min} from "class-validator";
import {ApiPropertyOptional} from "@nestjs/swagger";


/** Describes pagination query parameters used to retrieve a list of categories. */
export class  ListAllDto {
    @ApiPropertyOptional({
        description: `Page number to retrieve from the category collection. Pagination starts at page 1.

Example request:

\`\`\`http
GET /admin/categories?page=2&per_page=15
\`\`\``,
        default: 1,
        example: 2,
        minimum: 1,
        type: Number,
    })
    // @Type(() => Number)
    @IsInt()
    @Min(1)
    page:number = 1

    @ApiPropertyOptional({
        description: `Maximum number of categories returned on one page. The minimum accepted value is 5.

When this parameter is omitted, the endpoint returns up to 15 categories. Example with \`fetch\`:

\`\`\`js
const response = await fetch("/admin/categories?page=1&per_page=10");
const result = await response.json();
\`\`\``,
        default: 15,
        example: 10,
        minimum: 5,
        type: Number,
    })
    // @Type(() => Number)
    @IsInt()
    @Min(5)
    per_page:number = 15
}
