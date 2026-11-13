import {ForgotPasswordDto} from "@/user/application/input/forgot-password.dto";
import {Inject, Injectable} from "@nestjs/common";
import {IUserRepository, USER_REPOSITORY} from "@/user/domain/repositories/user.repository.interface";
import {UserNotFoundException} from "@/user/domain/exceptions/user-not-found.exception";
import {User} from "@/user/domain/entities/user.entity";
import {UserMailService} from "@/user/application/services/user-mail.service";
import {PasswordResetTokenFailed} from "@/user/domain/exceptions/password-reset-token-failed";
import {FrontendLinkBuilder} from "@/user/application/services/frontend-link-builder";
import {InjectEntityManager} from "@nestjs/typeorm";
import {EntityManager} from "typeorm";
import {
    UserAlreadyRequestedPasswordResetException
} from "@/user/domain/exceptions/user-already-requested-password-reset-exception";

@Injectable()
export class ForgotPasswordAction {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @Inject() private readonly mailerService: UserMailService,
        @Inject() private readonly frontEndLinkBuilder: FrontendLinkBuilder,
        @InjectEntityManager() private readonly manager: EntityManager
    ) {
    }

    async handle(context: ForgotPasswordDto): Promise<void> {

        const user = await this.userRepository.findByEmail(context.email)

        if (!user) {
            throw new UserNotFoundException()
        }

        if (user.passwordResetToken) {
            throw new UserAlreadyRequestedPasswordResetException()
        }


        user.generateToken()

        if (!user.passwordResetToken) {
            throw new PasswordResetTokenFailed()
        }


        await this.manager.save(user)

        const link = this.frontEndLinkBuilder.buildResetPasswordLink(user.passwordResetToken)
        const reportLink = this.frontEndLinkBuilder.resetPassword(user.passwordResetToken)
        await this.mailerService.sendPasswordReset(user.email, user.passwordResetToken, link,reportLink)


    }
}