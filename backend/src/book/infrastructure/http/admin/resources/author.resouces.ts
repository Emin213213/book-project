import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Author } from "@/book/domain/entities/author.entity";
import { AuthorStatus } from "@/book/domain/enum/author-status.enum";
import {AuthorAvatarStorage} from "@/book/application/service/author-avatar.storage";

/** Represents an author returned by the admin HTTP API. */
export class AuthorResource {
    @ApiProperty({
        description: "Unique identifier of the author.",
        example: "550e8400-e29b-41d4-a716-446655440000",
        format: "uuid",
    })
    id: string;

    @ApiProperty({
        description: "Author's first name.",
        example: "George",
    })
    firstName: string;

    @ApiProperty({
        description: "Author's last name.",
        example: "Orwell",
    })
    lastName: string;

    @ApiProperty({
        description: "Author's date of birth.",
        example: "1903-06-25T00:00:00.000Z",
        format: "date-time",
        type: String,
    })
    bornDate: Date;

    @ApiPropertyOptional({
        description: "Absolute URL of the author's avatar.",
        example: "https://example.com/authors/george-orwell.jpg",
        format: "uri",
        nullable: true,
    })
    avatar: string | undefined;

    @ApiProperty({
        description: "URL-friendly identifier of the author.",
        example: "george-orwell",
    })
    slug: string;

    @ApiProperty({
        description: "Publication status of the author.",
        enum: AuthorStatus,
        enumName: "AuthorStatus",
        example: AuthorStatus.DRAFT,
    })
    status: AuthorStatus;

    /** Converts an author entity into an HTTP resource. */
    static make(author: Author,authorAvatarStorage:AuthorAvatarStorage): AuthorResource {
        const resource = new AuthorResource();
        resource.id = author.id.toString();
        resource.firstName = author.firstName;
        resource.lastName = author.lastName;
        resource.bornDate = author.bornDate;
        resource.avatar = authorAvatarStorage.makeUrlFoPath(author.avatar)
        resource.slug = author.slug;
        resource.status = author.status;

        return resource;
    }

    /** Converts author entities into HTTP resources. */
    static collection(authors: Author[],authorAvatarStorage:AuthorAvatarStorage): AuthorResource[] {
        return authors.map(author => AuthorResource.make(author,authorAvatarStorage));
    }
}
