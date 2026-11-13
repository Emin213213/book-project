import {Inject, Injectable} from "@nestjs/common";
import {ConfirmOauthDto} from "@/user/application/input/confirm-oauth.dto";
import {OauthRegisterProvider} from "@/user/application/services/oauth-register.provider";
import {OauthProviderEnum} from "@/user/domain/enum/oauth-provider.enum";
import {IUserRepository, USER_REPOSITORY} from "@/user/domain/repositories/user.repository.interface";

import {User} from "@/user/domain/entities/user.entity";
import {Network} from "@/user/domain/entities/network.entity";
import {DataSource} from "typeorm";
import {SessionIssuer} from "@/user/application/services/session/session-issuer.service";
import type { RequestContext } from "@/user/application/input/request-context";

@Injectable()
export class ConfirmOauthAction {

    constructor(
        @Inject() private readonly registry: OauthRegisterProvider,
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        private readonly dataSource: DataSource,
        @Inject() private  readonly  sessionIssuer:SessionIssuer
    ) {}


    public async handle(context: ConfirmOauthDto, providerType: OauthProviderEnum, requestContext: RequestContext): Promise<{ user: User; accessToken: string; refreshToken: string; expiresAt: Date }> {
        const provider = this.registry.getProvider(providerType);
        const networkUser = await provider.authenticate(context.code);

        const user = await this.dataSource.transaction(async (entityManager) => {
            const existingUser = await this.userRepository.findByEmail(networkUser.email);
            if (existingUser) {
                return existingUser;
            }

            const newUser = User.createByNetwork(networkUser);
            const network = Network.createNetwork(networkUser);
            network.assignToUser(newUser);

            await entityManager.save(newUser);
            await entityManager.save(network);
            return newUser;
        });

        const tokens = await this.sessionIssuer.issue(user, requestContext);
        return {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt };
    }


}
