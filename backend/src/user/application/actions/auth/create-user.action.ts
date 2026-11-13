import {Inject, Injectable} from '@nestjs/common';
import {DataSource} from 'typeorm';
import {USER_REPOSITORY} from '../../../domain/repositories/user.repository.interface';
import type {IUserRepository} from '../../../domain/repositories/user.repository.interface';
import {CreateUserDto} from '../../input/create-user.dto';
import {User} from '../../../domain/entities/user.entity';
import {UserEmailAlreadyExistsException} from '../../../domain/exceptions/user-email-already-exists.exception';
import {RoleNotFoundException} from '../../../domain/exceptions/role-not-found.exception';
import {UserMailService} from '../../services/user-mail.service';
import {HasherService} from '@/common/application/services/hasher.service';
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
import {randomBytes} from "crypto";
import {FrontendLinkBuilder} from "@/user/application/services/frontend-link-builder";
import {UserHasNoVerificationTokenException} from "@/user/domain/exceptions/user_token_not_found.exception";
import {TokenHasher} from "@/user/application/services/token.hasher";
import {ROLE_REPOSITORY} from '@/user/domain/repositories/role.repository.interface';
import type { IRoleRepository } from '@/user/domain/repositories/role.repository.interface';

@Injectable()
export class CreateUserAction {

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly userMailService: UserMailService,
        private readonly hasher: HasherService,
        private readonly dataSource: DataSource,
        @Inject() private readonly frontEndLinkBuilder: FrontendLinkBuilder,
        @Inject() private readonly tokenHasher: TokenHasher,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository
    ) {
    }

    public async handle(context: CreateUserDto): Promise<void> {

        const user = await this.dataSource.transaction(async (entityManager) => {

            const existing = await this.userRepository.findByEmail(context.email)

            if (existing) {
                throw new UserEmailAlreadyExistsException()
            }

            const customerRole = await  this.roleRepository.findBySlug('customer')


            if (!customerRole) {
                throw new RoleNotFoundException('customer');
            }

            const token = randomBytes(30).toString('base64')

            const newUser = User.createUserByEmail(
                context.email,
                await this.hasher.hash(context.password),
                context.firstName,
                context.lastName,
                token,
                [customerRole],
                Uuid.generate()

            )
            newUser.generateEmailVerificationToken()

            if (!newUser.emailVerificationToken) {
                throw new UserHasNoVerificationTokenException()
            }

            await entityManager.save(newUser);

            return newUser;

        });

        if (!user.firstName) {
            throw new UserEmailAlreadyExistsException()
        }

        if (!user.emailVerificationToken) {
            throw new UserHasNoVerificationTokenException()
        }
        const link = this.frontEndLinkBuilder.buildVerifyEmailLink(this.tokenHasher.hash(user.emailVerificationToken))
        await this.userMailService.sendWelcome(user.email.value, user.firstName, link);


    }
}
