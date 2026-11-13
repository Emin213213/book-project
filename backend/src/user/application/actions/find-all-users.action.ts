import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { ListUsersDto } from '../input/list-users.dto';

@Injectable()
export class FindAllUsersAction {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(context: ListUsersDto): Promise<[User[], number]> {
    const qb = this.userRepository.createBaseQuery();

    if (context.firstName) this.userRepository.applyFirstNameFilter(qb, context.firstName);
    if (context.lastName) this.userRepository.applyLastNameFilter(qb, context.lastName);
    if (context.email) this.userRepository.applyEmailFilter(qb, context.email);

    const page = context.page ?? 1;
    const perPage = context.per_page ?? 15;

    return qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();
  }
}
