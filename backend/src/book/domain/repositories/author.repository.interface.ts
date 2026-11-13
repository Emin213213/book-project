import type { SelectQueryBuilder } from "typeorm";

import type { Author } from "@/book/domain/entities/author.entity";
import type { Uuid } from "@/common/domain/value-objects/uuid.vo";

/** Идентифицирует репозиторий авторов в контейнере NestJS. */
export const AUTHOR_REPOSITORY = Symbol("AUTHOR_REPOSITORY");

/** Описывает операции хранения, необходимые для авторов. */
export interface IAuthorRepository {
  createBaseQuery(): SelectQueryBuilder<Author>;
  findBySlug(slug: string): Promise<Author | null>;
  findById(id: Uuid): Promise<Author | null>;
  findManyByIds(ids: Uuid[]): Promise<Author[]>;
}
