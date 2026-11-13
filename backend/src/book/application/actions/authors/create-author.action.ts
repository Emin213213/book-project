import {Inject, Injectable} from "@nestjs/common";

import type {CreateAuthorDto} from "@/book/application/dto/authors/create-author.dto";
import {Author} from "@/book/domain/entities/author.entity";
import {
    AUTHOR_REPOSITORY,
    type IAuthorRepository,
} from "@/book/domain/repositories/author.repository.interface";
import {AuthorAlreadyExistsException} from "@/book/domain/exceptions/author-already-exists.exception";
import {DataSource} from "typeorm";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
import {AuthorAvatarStorage} from "@/book/application/service/author-avatar.storage";

/** Creates and persists an author. */
@Injectable()
export class CreateAuthorAction {
    constructor(
        @Inject(AUTHOR_REPOSITORY)
        private readonly authorRepository: IAuthorRepository,
        private readonly dataSource: DataSource,
        @Inject() private readonly authorAvatarStorage: AuthorAvatarStorage
    ) {
    }

    public async handle(context: CreateAuthorDto): Promise<Author> {
        const author = await this.authorRepository.findBySlug(context.slug)

        if (author) {
            throw new AuthorAlreadyExistsException()
        }

        return this.dataSource.transaction(async (em): Promise<Author> => {

            const id = Uuid.generate();
            const author = Author.create(
                id,
                context.firstName,
                context.lastName,
                context.slug,
                context.bornDate
            )


            if (context.avatar) {
                const path = await this.authorAvatarStorage.saveUploadedFile(context.avatar, id.value)

                author.changeAvatar(path)
            }

            return em.save(author)

        })


    }
}
