import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class DeleteUserAction {
  constructor(private readonly dataSource: DataSource) {}

  async handle(user: User): Promise<void> {
    await this.dataSource.transaction(async (em) => {
      await em.remove(user);
    });
  }
}
