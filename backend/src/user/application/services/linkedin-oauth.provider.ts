import {Injectable} from "@nestjs/common";
import {AbstractOauthProvider} from "@/user/application/services/abstract-oauth-provider";
import {OauthProviderEnum} from "@/user/domain/enum/oauth-provider.enum";
import {NetworkUser} from "@/user/domain/value-objects/network-user.vo";
import {Email} from "@/user/domain/value-objects/email.vo";

@Injectable()
export class LinkedinOauthProvider extends AbstractOauthProvider {
    async authenticate(code: string): Promise<NetworkUser> {
        return new NetworkUser(
            '',
            new Email(''),
            OauthProviderEnum.GOOGLE,
            new Date(),
        )
    }

    generateUrl(): string {
        return "https://www.linkedinapis.com/auth/userinfo.email"

    }

    getProvider(): OauthProviderEnum {
        return OauthProviderEnum.LINKEDIN
    }

}