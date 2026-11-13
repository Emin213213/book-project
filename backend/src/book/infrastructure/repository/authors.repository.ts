import {Injectable} from "@nestjs/common";
import {DataSource, Repository} from "typeorm";

import {Author} from "@/book/domain/entities/author.entity";
import type {IAuthorRepository} from "@/book/domain/repositories/author.repository.interface";
import type {SelectQueryBuilder} from "typeorm";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

/** Provides TypeORM persistence operations for authors. */
@Injectable()
export class AuthorsRepository
    extends Repository<Author>
    implements IAuthorRepository {
    constructor(private readonly dataSource: DataSource) {
        super(Author, dataSource.createEntityManager());
    }

    createBaseQuery(): SelectQueryBuilder<Author> {
        return this.createQueryBuilder();
    }

    async findBySlug(slug: string) {
        return this.createQueryBuilder("author")
            .where("author.slugValue = :slug", {slug})
            .getOne();
    }

    async findById(id: Uuid): Promise<Author | null> {
        return this.createQueryBuilder("author")
            .where("author.idValue = :id", {id: id.value})
            .getOne();
    }

    /** Возвращает только существующих авторов; вызывающий сам сверяет количество. */
    async findManyByIds(ids: Uuid[]): Promise<Author[]> {
        if (ids.length === 0) {
            return [];
        }

        return this.createQueryBuilder("author")
            .where("author.idValue IN (:...ids)", {ids: ids.map((id) => id.value)})
            .getMany();
    }
}
