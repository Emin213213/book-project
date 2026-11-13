import {Category} from "@/book/domain/entities/category.entity";
import {ICategoryRepository} from "@/book/domain/repositories/category.repository.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {Book} from "@/book/domain/entities/book.entity";
import {DataSource, Repository, SelectQueryBuilder} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

@Injectable()
export class CategoryRepository extends Repository<Category> implements ICategoryRepository {

    constructor(
        private readonly dataSource: DataSource
    ) {
        super(Category, dataSource.createEntityManager())
    }

    public async findBySlug(slug: string) {
        return this.findOneBy({slug})
    }

    public async findById(id: Uuid): Promise<Category | null> {
        return this.createQueryBuilder("category")
            .where("category.id = :id", {id: id.value})
            .getOne();
    }

    public createBaseQuery():SelectQueryBuilder<Category> {
        return this.createQueryBuilder()
    }

}