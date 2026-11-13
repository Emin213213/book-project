import {IUserRepository, USER_REPOSITORY} from "@/user/domain/repositories/user.repository.interface";
import {ResetPasswordDto} from "@/user/application/input/reset-password.dto";
import bcrypt from "bcrypt";
import {EntityManager} from "typeorm";
import {Inject, Injectable} from "@nestjs/common";
import {UserNotFoundException} from "@/user/domain/exceptions/user-not-found.exception";
import {
    PasswordConfirmationMismatchException
} from "@/user/domain/exceptions/password-confirmation-mismatch-.exception";
import {InjectEntityManager} from "@nestjs/typeorm";


@Injectable()
export class ResetPasswordAction {
    constructor(
        @Inject(USER_REPOSITORY)
        @Inject() private readonly userRepository: IUserRepository,
        @InjectEntityManager() private readonly manager: EntityManager
    ) {}


    public async handle(context: ResetPasswordDto) {

        const user = await this.userRepository.findByEmail(context.user.email);

        if (!user) {
            throw new UserNotFoundException();
        }

        if (context.password !== context.password_confirmation) {
            throw new PasswordConfirmationMismatchException();
        }

        user.password = await bcrypt.hash(
            context.password,
            10
        );

        user.passwordResetToken = null;

        await this.manager.save(user);

    }


}