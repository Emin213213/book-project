import {Inject, Injectable} from "@nestjs/common";
import {IUserRepository, USER_REPOSITORY} from "@/user/domain/repositories/user.repository.interface";
import {UnnauthorizedResetPasswordDto} from "@/user/application/input/unnauthorized-reset-password.dto";
import {UserNotFoundException} from "@/user/domain/exceptions/user-not-found.exception";
import {InjectEntityManager} from "@nestjs/typeorm";
import {EntityManager} from "typeorm";

@Injectable()
export class UnnauthorizedResetAction {

    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @InjectEntityManager() private readonly manager: EntityManager
    ) {}


    public async handle(context: UnnauthorizedResetPasswordDto) {
        const user = await this.userRepository.findByResetToken(context.token)

        if (!user) {
            throw new UserNotFoundException()
        }

        user.passwordResetToken = null;


        await this.manager.save(user)
    }

}