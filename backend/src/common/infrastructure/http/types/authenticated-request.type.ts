import type {Request} from "express";
import {User} from "@/user/domain/entities/user.entity";

 export interface AuthenticatedRequestType extends  Request{
    auth:{
        user:User
    }
}