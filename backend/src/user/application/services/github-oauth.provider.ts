import {AbstractOauthProvider} from "@/user/application/services/abstract-oauth-provider";
import {NetworkUser} from "@/user/domain/value-objects/network-user.vo";
import {OauthProviderEnum} from "@/user/domain/enum/oauth-provider.enum";
import {Inject, Injectable} from "@nestjs/common";
import {GOOGLE_OAUTH_CLIENT} from "@/user/infrastructure/constants";
import {OAuth2Client} from "google-auth-library";
import {Email} from "@/user/domain/value-objects/email.vo";


@Injectable()
export class GithubOauthProvider extends AbstractOauthProvider {

    constructor() {
        super();
    }

    getProvider(): OauthProviderEnum {
        return OauthProviderEnum.GITHUB;
    }

    async authenticate(code: string): Promise<NetworkUser> {
        return new NetworkUser(
            '',
            new Email(''),
            OauthProviderEnum.GOOGLE,
            new Date(),
        )

    }

    generateUrl(): string {
        return "https://www.githubapis.com/auth/userinfo.email"
    }


}