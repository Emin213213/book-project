import {PartialType} from "@nestjs/swagger";
import {CreateAuthorDto} from "@/book/application/dto/authors/create-author.dto";


export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {


}