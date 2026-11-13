
import {Category} from "@/book/domain/entities/category.entity";
import {ApiProperty} from "@nestjs/swagger";

export class CategoryResource{
  @ApiProperty({
    description:'id',
    type:"number"
  })
  id: string;
  @ApiProperty({
    description:'title',
    type:"string"
  })
  title: string;
  @ApiProperty({
    description:'slug',
    type:"string",
    example:'igra prestolov'
  })
  slug:string

  @ApiProperty({
    description:' createdAt',
    type:'string',
    example:'10-12-2021'
  })
  createdAt: Date;

  @ApiProperty({
    description:'updatedAt',
    type:"string",
    example:'10-12-2011'
  })
  updatedAt: Date;

  static make(category:Category): CategoryResource {
    const resource = new CategoryResource();
    resource.id = category.id.value;
    resource.title = category.title;
    resource.slug = category.slug
    resource.createdAt = category.created_at;
    resource.updatedAt = category.updated_at;
    return resource;
  }

  static collection(categories:Category[]): CategoryResource[] {
    return categories.map(CategoryResource.make);
  }

}
