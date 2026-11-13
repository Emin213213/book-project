import {Inject, Injectable} from "@nestjs/common";
import {LoginByMailDto} from "@/user/application/input/login-by-mail.dto";
import {IUserRepository, USER_REPOSITORY} from "@/user/domain/repositories/user.repository.interface";
import {UserNotFoundException} from "@/user/domain/exceptions/user-not-found.exception";
import bcrypt from 'bcrypt'
import {UserInvalidCredential} from "@/user/domain/exceptions/user-invalid-credential";
import type {User} from "@/user/domain/entities/user.entity";
import {SessionIssuer} from "@/user/application/services/session/session-issuer.service";
import type { RequestContext } from "@/user/application/input/request-context";

@Injectable()
export class LoginByMailAction {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject() private  readonly  sessionIssuer:SessionIssuer

    ) {}

    public async handle(
        context: LoginByMailDto,
        requestContext: RequestContext,
    ): Promise<{ user: User; accessToken: string; refreshToken: string; expiresAt: Date }> {

        const user = await this.userRepository.findByEmail(context.email)

        if (!user) {
            throw new UserNotFoundException()
        }

        if (user.password == null) {
            throw new UserInvalidCredential();
        }

        const isEqual = await bcrypt.compare(context.password, user.password);

        if (!isEqual) {
            throw new UserInvalidCredential();
        }

        user.registerSuccessfulLogin(requestContext.ip)

        const issuedToken = await this.sessionIssuer.issue(user, requestContext,context.rememberMe);

        await this.userRepository.save(user)
        return {
            user,
            accessToken: issuedToken.accessToken,
            refreshToken: issuedToken.refreshToken,
            expiresAt: issuedToken.expiresAt,
        };


    }

}