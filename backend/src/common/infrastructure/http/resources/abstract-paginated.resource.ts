import { ApiProperty } from "@nestjs/swagger";

import { PaginationMetadataResource } from "./pagination-metadata.resource";

/**
 * Defines the common HTTP response structure for paginated collections.
 *
 * Concrete subclasses must document the item type because OpenAPI cannot infer
 * a TypeScript generic type at runtime.
 *
 * @typeParam T the resource type stored in the current page
 */
export abstract class AbstractPaginatedResource<T> {
  @ApiProperty({
    description: "The resources available on the current page.",
    isArray: true,
    type: () => Object,
  })
  data: T[];

  @ApiProperty({
    description: "Pagination metadata for the collection.",
    type: () => PaginationMetadataResource,
  })
  meta: PaginationMetadataResource;
}
