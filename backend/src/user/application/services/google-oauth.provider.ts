import {Inject, Injectable} from "@nestjs/common";
import {AbstractOauthProvider} from "@/user/application/services/abstract-oauth-provider";
import {OauthProviderEnum} from "@/user/domain/enum/oauth-provider.enum";
import {OAuth2Client} from "google-auth-library";
import {ConfigReader} from "@/user/application/services/config.reader";
import {NetworkUser} from "@/user/domain/value-objects/network-user.vo";
import {Email} from "@/user/domain/value-objects/email.vo";
import {OauthAuthenticationException} from "@/user/domain/exceptions/oauth-authentication.exception";
import {ILoggerService} from "@/common/application/services/tokens";
import {LoggerServiceInterface} from "@/common/domain/contracts/logger.service.interface";

@Injectable()
export class GoogleOauthProvider extends AbstractOauthProvider {
    private client: OAuth2Client

    constructor(
        @Inject() private readonly configReader: ConfigReader,
        @Inject(ILoggerService) private  readonly  logger:LoggerServiceInterface
    ) {
        super();
        this.client = new OAuth2Client({
            clientId: configReader.getGoogleClientId(),
            clientSecret: configReader.getGoogleSecret(),
            redirectUri: configReader.getGoogleCallBackUrl()
        })
    }

    async authenticate(code: string): Promise<NetworkUser> {
        const response = await this.client.getToken(code)

        if (!response.tokens.id_token) {
            this.logger.error('ID token was not returned by the OAuth provider.',this.getProvider())
            throw new OauthAuthenticationException('Failed to authenticate user via OAuth provider.')
        }

        const tiket = await this.client.verifyIdToken({idToken: response.tokens.id_token})

        const payload = tiket.getPayload()

        if (!payload?.sub) {
            this.logger.error('OAuth token payload does not contain the "sub" claim.',this.getProvider());
            throw new OauthAuthenticationException('Failed to authenticate user via OAuth provider')
        }

        if (!payload?.email) {
            this.logger.error('OAuth token payload does not contain the "email" claim.',this.getProvider());
            throw new OauthAuthenticationException('Failed to authenticate user via OAuth provider')
        }

        return new NetworkUser(
            payload?.sub,
            new Email(payload?.email),
            OauthProviderEnum.GOOGLE,
            new Date(),
            payload?.picture,
        )


    }

    generateUrl(): string {
        const url = this.client.generateAuthUrl({
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ]
        })
        return url
    }

    getProvider(): OauthProviderEnum {
        return OauthProviderEnum.GOOGLE
    }


}