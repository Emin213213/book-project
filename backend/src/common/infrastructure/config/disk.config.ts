import {registerAs} from "@nestjs/config";

export const diskConfig = registerAs('disk',() => ({
    public:'pubic',
    book:'book',
    author:'author'
}))