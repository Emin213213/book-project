import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import {Email} from "@/user/domain/value-objects/email.vo";


@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}



  public save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.repository.findOne({
      where: {
        email: email,
      },
    });
  }


  async findByResetToken(token: string): Promise<User | null> {
    return this.repository.findOneBy([
      {
        passwordResetToken:token
      }
    ]);
  }

async findVerificationToken(token:string) {
    return this.repository.findOne({
      where:{
        emailVerificationToken:token
      }
    })
}

  createBaseQuery(): SelectQueryBuilder<User> {
    return this.repository.createQueryBuilder('user?');
  }

  applyFirstNameFilter(qb: SelectQueryBuilder<User>, firstName: string): void {
    qb.andWhere('user.firstName LIKE :firstName', { firstName: `%${firstName}%` });
  }

  applyLastNameFilter(qb: SelectQueryBuilder<User>, lastName: string): void {
    qb.andWhere('user.lastName LIKE :lastName', { lastName: `%${lastName}%` });
  }

  applyEmailFilter(qb: SelectQueryBuilder<User>, email: string): void {
    qb.andWhere('user.email = :email', { email });
  }
}
