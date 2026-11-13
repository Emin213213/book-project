import {OmitType, PartialType} from "@nestjs/swagger";
import {CreateCategoryDto} from "@/book/application/dto/category/create-category.dto";


export class UpdateCategoryDto  extends PartialType(CreateCategoryDto) {

}