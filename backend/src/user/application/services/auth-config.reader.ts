import {authConfig} from "@/user/infrastructure/config/auth.config";
import {Inject} from "@nestjs/common";
import {ConfigType} from "@nestjs/config";


export class AuthConfigReader {

    constructor(
        @Inject(authConfig.KEY) private  readonly auth:ConfigType<typeof authConfig >
    ) {}

    public accessTokenTtlMs(): number {
       return  this.auth.expiresIn
    }

    public refreshTokenTtlMs(rememberMe: boolean): number {
        return rememberMe
            ? this.auth.rememberMeRefreshExpiresIn
            : this.auth.refreshExpiresIn;
    }


}