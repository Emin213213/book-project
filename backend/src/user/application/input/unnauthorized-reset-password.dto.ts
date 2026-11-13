import {IsNotEmpty} from "class-validator";


    export class UnnauthorizedResetPasswordDto {

    @IsNotEmpty({
        message: 'Введите корректный токен'
    })
    token:string;

}