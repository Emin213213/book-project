import {Injectable} from "@nestjs/common";
import {Author} from "@/book/domain/entities/author.entity";
import {UpdateAuthorDto} from "@/book/application/dto/authors/update-author.dto";
import {DataSource} from "typeorm";

@Injectable()
export class UpdateAuthorAction {

    constructor(
        private readonly dateSource: DataSource
    ) {}

    public async handle(author: Author, context: UpdateAuthorDto) {

        return this.dateSource.transaction(async (em)=> {
            if(context.firstName) {
                author.rename(context.firstName)
            }

            if(context.lastName) {
                author.rename(context.lastName)
            }

            if(context.slug) {
                author.changeSlug(context.slug)
            }

            // if(context.avatar) {
            //     author.changeAvatar(context.avatar)
            // }

            if(context.bornDate){
                author.changeBornDate(context.bornDate)
            }


            return em.save(author)
        })

    }
}