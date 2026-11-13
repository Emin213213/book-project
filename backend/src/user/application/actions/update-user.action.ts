import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateUserDto } from '../input/update-user.dto';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { HasherService } from '@/common/application/services/hasher.service';

@Injectable()
export class UpdateUserAction {
  constructor(
    // private readonly hasher: HasherService,
    private readonly dataSource: DataSource,
  ) {}

  async handle(user: User, context: UpdateUserDto): Promise<void> {
    // return this.dataSource.transaction(async (em) => {
      // if (context.firstName !== undefined) user.firstName = context.firstName;
      // if (context.lastName !== undefined) user.lastName = context.lastName;
      // if (context.email !== undefined) user.email = new Email(context.email);
      // if (context.password !== undefined) user.password = await this.hasher.hash(context.password);

      // return em.save(user);
    // });
  }
}
