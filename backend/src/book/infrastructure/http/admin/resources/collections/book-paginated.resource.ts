import {ApiProperty} from "@nestjs/swagger";

import type {Book} from "@/book/domain/entities/book.entity";
import {BookResource} from "@/book/infrastructure/http/admin/resources/book.resource";
import {AbstractPaginatedResource} from "@/common/infrastructure/http/resources/abstract-paginated.resource";
import {PaginationMetadataResource} from "@/common/infrastructure/http/resources/pagination-metadata.resource";
import {BookCoverStorage} from "@/book/application/service/book-cover.storage";
import {AuthorAvatarStorage} from "@/book/application/service/author-avatar.storage";

/** Represents a paginated collection of books in an HTTP response. */
export class BookPaginatedResource extends AbstractPaginatedResource<BookResource> {
    @ApiProperty({
        description: "The books available on the current page.",
        isArray: true,
        type: () => BookResource,
    })
    declare data: BookResource[];

    @ApiProperty({
        description: "Pagination metadata for the book collection.",
        type: () => PaginationMetadataResource,
    })
    declare meta: PaginationMetadataResource;

    /**
     * Creates a paginated book resource.
     *
     * @param data the books available on the current page
     * @param total the total number of books
     * @param page the current page number
     * @param perPage the maximum number of books per page
     * @returns the paginated book resource
     */
    static make(
        data: Book[],
        total: number,
        page: number,
        perPage: number,
        bookCoverStorage: BookCoverStorage,
        authorAvatarStorage: AuthorAvatarStorage,
    ): BookPaginatedResource {
        const resource = new BookPaginatedResource();
        resource.data = BookResource.collection(
            data,
            bookCoverStorage,
            authorAvatarStorage,
        );
        resource.meta = PaginationMetadataResource.make(total, page, perPage);
        return resource;
    }
}
