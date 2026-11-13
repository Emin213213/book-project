import type { SelectQueryBuilder } from "typeorm";

import type { Category } from "@/book/domain/entities/category.entity";
import type { Uuid } from "@/common/domain/value-objects/uuid.vo";

/** Идентифицирует репозиторий категорий в контейнере NestJS. */
export const BOOK_CATEGORY_REPOSITORY = Symbol('BOOK_CATEGORY_REPOSITORY');

/** Описывает операции хранения, необходимые для категорий. */
export interface ICategoryRepository {
    findBySlug(slug: string): Promise<Category | null>;
    findById(id: Uuid): Promise<Category | null>;
    createBaseQuery(): SelectQueryBuilder<Category>;
    remove(category: Category): Promise<Category>;
}
