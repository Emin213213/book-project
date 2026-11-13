import {IsNotEmpty, IsOptional, IsString} from "class-validator";
import {User} from "@/user/domain/entities/user.entity";


export class ResetPasswordDto {

    @IsOptional()
    user: User

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    password_confirmation: string;


    public withUser(authUser: User) {
        this.user = authUser
    }

}