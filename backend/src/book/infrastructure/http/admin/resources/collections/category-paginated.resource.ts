import { ApiProperty } from "@nestjs/swagger";

import type { Category } from "@/book/domain/entities/category.entity";
import { CategoryResource } from "@/book/infrastructure/http/admin/resources/category.resource";
import { AbstractPaginatedResource } from "@/common/infrastructure/http/resources/abstract-paginated.resource";
import { PaginationMetadataResource } from "@/common/infrastructure/http/resources/pagination-metadata.resource";

/** Represents a paginated collection of categories in an HTTP response. */
export class CategoryPaginatedResource extends AbstractPaginatedResource<CategoryResource> {
  @ApiProperty({
    description: "The categories available on the current page.",
    isArray: true,
    type: () => CategoryResource,
  })
  declare data: CategoryResource[];

  @ApiProperty({
    description: "Pagination metadata for the category collection.",
    type: () => PaginationMetadataResource,
  })
  declare meta: PaginationMetadataResource;

  /**
   * Creates a paginated category resource.
   *
   * @param data the categories available on the current page
   * @param total the total number of categories
   * @param page the current page number
   * @param perPage the maximum number of categories per page
   * @returns the paginated category resource
   */
  static make(
    data: Category[],
    total: number,
    page: number = 1,
    perPage: number = 15,
  ): CategoryPaginatedResource {
    const resource = new CategoryPaginatedResource();
    resource.meta = PaginationMetadataResource.make(total, page, perPage);
    resource.data = CategoryResource.collection(data);
    return resource;
  }
}
