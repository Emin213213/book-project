import { STR_HELPER } from "@/common/application/ports/str-helper.interface";
import type { StrHelperInterface } from "@/common/application/ports/str-helper.interface";
    import {Inject, Injectable} from "@nestjs/common";
    import {UpdateCategoryDto} from "@/book/application/dto/category/update-category.dto";
    import {
        BOOK_CATEGORY_REPOSITORY,
        type ICategoryRepository,
    } from "@/book/domain/repositories/category.repository.interface";
    import {CategoryNotExistException} from "@/book/domain/exceptions/category-not-exist.exception";
    import {CategoryAlreadyExistsException} from "@/book/domain/exceptions/category-already-exists.exception";
    import {DataSource} from "typeorm";

    @Injectable()
    export class UpdateCategoryAction {

        constructor(
        @Inject(STR_HELPER)
        private readonly strHelper: StrHelperInterface,
            @Inject(BOOK_CATEGORY_REPOSITORY)
            private readonly categoryRepository: ICategoryRepository,
            private readonly dataSource: DataSource
        ) {
        }

        public async handle(context: UpdateCategoryDto, slug: string) {
            const normalizedSlug = (context.slug === undefined || context.slug === null)
                ? undefined
                : this.strHelper.slug(context.slug);
            await this.assertCategoryAvailable(normalizedSlug)
            const category = await this.assertCategoryExist(slug)

            if (normalizedSlug) {
                category.slug = normalizedSlug
            }

            if (context.title) {
                category.title = context.title
            }

            await this.dataSource.manager.save(category)
            return category
        }

        private async assertCategoryExist(slug: string) {
            const category = await this.categoryRepository.findBySlug(slug)
            if (!category) {
                throw new CategoryNotExistException()
            }

            return category
        }

        private async assertCategoryAvailable(slug: string | undefined) {
            if (!slug) {
                return
            }

            const category = await this.categoryRepository.findBySlug(slug)

            if (category) {
                throw new CategoryAlreadyExistsException()
            }
        }

    }