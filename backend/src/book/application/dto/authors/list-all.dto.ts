import {IsInt, Min} from "class-validator";
import {ApiPropertyOptional} from "@nestjs/swagger";


/** Describes pagination query parameters used to retrieve a list of authors. */
export class ListAllDTO {

    @ApiPropertyOptional({
        description: `Page number to retrieve. Pagination starts at page 1.

Example request:

\`\`\`http
GET /admin/authors?page=2&per_page=25
\`\`\``,
        default: 1,
        example: 2,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @Min(1)
    page:number = 1

    @ApiPropertyOptional({
        description: `Maximum number of authors returned on one page. The minimum accepted value is 5.

When the parameter is omitted, the endpoint returns up to 25 authors. For example:

\`\`\`js
const response = await fetch("/admin/authors?page=1&per_page=10");
const result = await response.json();
\`\`\``,
        default: 25,
        example: 10,
        minimum: 5,
        type: Number,
    })
    @IsInt()
    @Min(5)
    per_page:number = 25

}
