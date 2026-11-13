import { ApiProperty } from "@nestjs/swagger";

import type { Author } from "@/book/domain/entities/author.entity";
import { AuthorResource } from "@/book/infrastructure/http/admin/resources/author.resouces";
import { AbstractPaginatedResource } from "@/common/infrastructure/http/resources/abstract-paginated.resource";
import { PaginationMetadataResource } from "@/common/infrastructure/http/resources/pagination-metadata.resource";
import {AuthorAvatarStorage} from "@/book/application/service/author-avatar.storage";

/** Represents a paginated collection of authors in an HTTP response. */
export class AuthorPaginatedResource extends AbstractPaginatedResource<AuthorResource> {
  @ApiProperty({
    description: "The authors available on the current page.",
    isArray: true,
    type: () => AuthorResource,
  })
  declare data: AuthorResource[];

  @ApiProperty({
    description: "Pagination metadata for the author collection.",
    type: () => PaginationMetadataResource,
  })
  declare meta: PaginationMetadataResource;

  /**
   * Creates a paginated author resource.
   *
   * @param data the authors available on the current page
   * @param total the total number of authors
   * @param page the current page number
   * @param perPage the maximum number of authors per page
   * @returns the paginated author resource
   */
  static make(
    data: Author[],
    total: number,
    imageStorage: AuthorAvatarStorage,
    page: number = 1,
    perPage: number = 25,
  ): AuthorPaginatedResource {
    const resource = new AuthorPaginatedResource();
    resource.data = AuthorResource.collection(data,imageStorage);
    resource.meta = PaginationMetadataResource.make(total, page, perPage);
    return resource;
  }
}
