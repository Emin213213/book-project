import {IsNotEmpty, IsString} from "class-validator";

export class ConfirmOauthDto {

    @IsString()
    @IsNotEmpty()
    code: string

}