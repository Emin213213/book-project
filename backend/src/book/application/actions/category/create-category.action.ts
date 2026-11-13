import { STR_HELPER } from "@/common/application/ports/str-helper.interface";
import type { StrHelperInterface } from "@/common/application/ports/str-helper.interface";
import {CreateCategoryDto} from "@/book/application/dto/category/create-category.dto";
import {Inject, Injectable} from "@nestjs/common";
import {BookAlreadyExistsException} from "@/book/domain/exceptions/book-already-exists.exception";
import {Category} from "@/book/domain/entities/category.entity";
import {DataSource} from "typeorm";
import {
    BOOK_CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from "@/book/domain/repositories/category.repository.interface";


@Injectable()
export class CreateCategoryAction {
    constructor(
        @Inject(STR_HELPER)
        private readonly strHelper: StrHelperInterface,
        @Inject(BOOK_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
        private readonly  dataSource:DataSource
    ) {}



    public async handle(context: CreateCategoryDto): Promise<Category> {
        const slug = this.strHelper.slug(context.slug);
        await this.assertCategoryExist(slug)
        const  category  = new Category(context.title, slug)
        return    await this.dataSource.manager.save(category,{reload:true})

    }


    private async assertCategoryExist(slug: string): Promise<void> {
        const category = await this.categoryRepository.findBySlug(slug)
        if (category) {
            throw new BookAlreadyExistsException();
        }
    }
}