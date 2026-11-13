import {registerAs} from "@nestjs/config";
import * as process from "node:process";

export  const OauthConfig = registerAs('oauth',() => ({
    googleClientId:process.env.GOOGLE_AUTH_CLIENT_ID??'',
    googleSecret:process.env.GOOGLE_AUTH_CLIENT_SECRET??'',
    googleCallbackUrl:process.env.GOOGLE_AUTH_REDIRECT_URI??''
}))