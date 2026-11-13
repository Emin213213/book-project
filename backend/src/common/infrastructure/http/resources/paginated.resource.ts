import { PaginationMetadataResource } from './pagination-metadata.resource';

interface Pageable {
  page?: number;
  per_page?: number;
}

export class PaginatedResource<T> {
  data: T[];
  meta: PaginationMetadataResource;

  static make<T>(data: T[], total: number, query: Pageable): PaginatedResource<T> {
    const resource = new PaginatedResource<T>();
    resource.data = data;
    resource.meta = PaginationMetadataResource.make(total, query.page ?? 1, query.per_page ?? 15);
    return resource;
  }
}
