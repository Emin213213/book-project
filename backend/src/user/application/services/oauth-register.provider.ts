import {OauthProviderEnum} from "@/user/domain/enum/oauth-provider.enum";
import {AbstractOauthProvider} from "@/user/application/services/abstract-oauth-provider";
import {Inject, Injectable} from "@nestjs/common";
import {GoogleOauthProvider} from "@/user/application/services/google-oauth.provider";
import {GithubOauthProvider} from "@/user/application/services/github-oauth.provider";
import {LinkedinOauthProvider} from "@/user/application/services/linkedin-oauth.provider";
import {InvalidProviderException} from "@/user/domain/exceptions/invalid-provider.exception";

@Injectable()
export class OauthRegisterProvider {

    private readonly strategies = new Map<OauthProviderEnum , AbstractOauthProvider>()

    constructor(
        @Inject() googleProvider: GoogleOauthProvider,
        @Inject() githubProvider: GithubOauthProvider,
        @Inject() linkedInProvider: LinkedinOauthProvider
    ) {
        this.strategies.set(googleProvider.getProvider(), googleProvider)
        this.strategies.set(githubProvider.getProvider(), githubProvider)
        this.strategies.set(linkedInProvider.getProvider(), linkedInProvider)
    }

    public getProvider(provider: OauthProviderEnum):AbstractOauthProvider {
        const strategy = this.strategies.get(provider)

        if (!strategy) {
            throw new InvalidProviderException()
        }

        return strategy
    }
}