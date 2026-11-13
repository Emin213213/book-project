import {IsBoolean, IsNotEmpty, IsOptional, MinLength} from "class-validator";
import {Email} from "@/user/domain/value-objects/email.vo";
import {Transform} from "class-transformer";


export class LoginByMailDto {


    @IsNotEmpty({
        message: 'Введите корректный email'
    })
    @Transform(({value}) => new Email(value))
    email: Email;


    @MinLength(6)
    @IsNotEmpty({
        message: 'Пароль должен содержать не менее 6 символов'
    })
    public password: string;

    @IsOptional()
    @IsBoolean()
    public readonly rememberMe?: boolean;

}