import {IsString, IsNotEmpty} from 'class-validator';
import {ApiParam, ApiProperty} from "@nestjs/swagger";


export class CreateCategoryDto {

    @ApiProperty({
        description: 'this is Book title',
        type:'string',
        nullable:false,
        default:'title'
    })

    @IsNotEmpty()
    @IsString()
    public title: string


    @ApiProperty({
        type:'string',
        nullable:false,
        default:'slug'
    })
    @IsString()
    @IsNotEmpty()
    public slug: string



}