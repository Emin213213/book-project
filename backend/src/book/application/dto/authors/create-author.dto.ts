import {Type} from "class-transformer";
import {
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateAuthorDto {
    @ApiProperty({
        description:
            "Author's first name. The value is required, must be a string, and cannot be empty.",
        example: "George",
    })
    @IsString()
    @IsNotEmpty()
    public firstName: string;

    @ApiProperty({
        description:
            "Author's last name. The value is required, must be a string, and cannot be empty.",
        example: "Orwell",
    })
    @IsString()
    @IsNotEmpty()
    public lastName: string;

    @ApiProperty({
        description:
            "URL-friendly identifier used to address the author in routes. Send a non-empty string, for example a lowercase value with words separated by hyphens.",
        example: "george-orwell",
    })
    @IsString()
    @IsNotEmpty()
    public slug: string;

    @ApiProperty({
        description:
            "Author's date of birth. Send an ISO 8601 date string; class-transformer converts it to a Date before validation.",
        example: "1903-06-25",
        format: "date",
        type: String,
    })
    @Type(() => Date)
    @IsDate()
    public bornDate: Date;

    @IsOptional()
    public avatar?: any

    public withAvatar(file: Express.Multer.File) {
        this.avatar = file
    }


}
