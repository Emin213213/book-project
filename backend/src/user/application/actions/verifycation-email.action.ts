import {VerifyEmailDto} from "@/user/application/input/verify-email.dto";
import {Body, Inject, Injectable} from "@nestjs/common";
import {IUserRepository, USER_REPOSITORY} from "@/user/domain/repositories/user.repository.interface";
import {VerificationEmailTokenException} from "@/user/domain/exceptions/verification_email_token.exception";
import {InjectEntityManager} from "@nestjs/typeorm";
import {EntityManager} from "typeorm";

@Injectable()
export class VerifycationEmailAction {


    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        @InjectEntityManager() private readonly manager: EntityManager
    ) {
    }


    public async handle(context: VerifyEmailDto) {
        console.log('DTO:', context);
        console.log('TOKEN:', context.token);

        const user = await this.userRepository.findVerificationToken(context.token);

        console.log('USER:',user);

        if (!user) {
            throw new VerificationEmailTokenException();
        }
        user.emailVerificationToken = null

        await this.manager.save(user);
    }
}
