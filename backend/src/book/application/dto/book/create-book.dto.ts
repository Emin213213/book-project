import {
    ArrayNotEmpty,
    IsDefined,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
} from 'class-validator';
import {Transform, Type} from "class-transformer";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

import {Isbn} from "@/common/domain/value-objects/isbn.vo";

export class CreateBookDto {

    @ApiProperty({
        description: "Название книги. Обязательное, непустая строка.",
        example: "1984",
    })
    @IsNotEmpty()
    @IsString()
    public title: string

    @ApiProperty({
        description:
            "Человекочитаемый идентификатор книги в URL. Значение нормализуется " +
            "перед сохранением, поэтому можно прислать обычное название.",
        example: "1984",
    })
    @IsString()
    @IsNotEmpty()
    public slug: string

    @ApiProperty({
        description:
            "ISBN строкой. Перед валидацией значение превращается в объект-значение `Isbn`.",
        example: "978-0-452-28423-4",
        type: String,
    })
    @Transform(({value}) =>
        value === undefined || value === null
            ? value
            : Isbn.fromString(String(value).trim()),
    )
    @IsDefined()
    public isbn: Isbn

    @ApiProperty({
        description: "Идентификатор категории книги.",
        example: "550e8400-e29b-41d4-a716-446655440000",
        format: "uuid",
    })
    @IsUUID()
    public categoryId: string

    @ApiProperty({
        description:
            "Идентификаторы авторов книги. Нужен хотя бы один. " +
            "В multipart/form-data одиночное значение приходит строкой, поэтому " +
            "перед валидацией оно оборачивается в массив.",
        example: ["550e8400-e29b-41d4-a716-446655440001"],
        isArray: true,
        type: String,
    })
    @Transform(({value}) => (Array.isArray(value) ? value : [value]))
    @ArrayNotEmpty()
    @IsUUID(undefined, {each: true})
    public authorIds: string[]

    @ApiProperty({
        description: "Цена книги, положительное целое.",
        example: 299,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public price: number

    @ApiProperty({
        description: "Год издания, положительное целое.",
        example: 1949,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public year: number

    @ApiProperty({
        description: "Количество страниц, положительное целое.",
        example: 328,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public pages: number

    @ApiProperty({
        description: "Описание книги.",
        example: "Роман-антиутопия о слежке, цензуре и тоталитарной власти.",
    })
    @IsString()
    public description: string

    @ApiProperty({
        description: "Начальное количество экземпляров.",
        example: 20,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public quantity: number

    @ApiPropertyOptional({
        description: "Файл обложки.",
        format: "binary",
        type: "string",
    })
    @IsOptional()
    public cover?: Express.Multer.File

    public withCover(file?: Express.Multer.File): void {
        this.cover = file
    }
}
