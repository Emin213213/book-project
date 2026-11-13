import {IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";
import {Email} from "@/user/domain/value-objects/email.vo";
import {Transform} from "class-transformer";
import {ApiProperty} from "@nestjs/swagger";


export class CreateUserDto {

    @IsString()
    @ApiProperty()
    @IsNotEmpty({
        message: 'Имя должно быть строкой'
    })
    firstName: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty({
        message: 'Фамилия должна быть строкой'
    })
    lastName: string;



    @IsNotEmpty({
        message: 'Введите корректный email'
    })
    @ApiProperty()
    @Transform(({value}) => new Email(value))
    email: Email;


    @MinLength(6)
    @ApiProperty()
    @IsNotEmpty({
        message: 'Пароль должен содержать не менее 6 символов'
    })
    public password: string;
}