import {IsNotEmpty} from "class-validator";
import {Transform} from "class-transformer";
import {Email} from "@/user/domain/value-objects/email.vo";


export class ForgotPasswordDto {

    @IsNotEmpty({
        message: 'Введите корректный email'
    })
    @Transform(({value}) => new Email(value))
    email: Email;



}