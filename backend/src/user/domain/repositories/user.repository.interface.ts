import type {SelectQueryBuilder} from 'typeorm';
import {User} from '../entities/user.entity';
import {Email} from "@/user/domain/value-objects/email.vo";


export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
    save(user: User): Promise<User>;

    findByEmail(email: Email | undefined): Promise<User | null>;

    findByResetToken(token: string): Promise<User | null>;

    findVerificationToken(token:string): Promise<User | null>;

    createBaseQuery(): SelectQueryBuilder<User>;

    applyFirstNameFilter(qb: SelectQueryBuilder<User>, firstName: string): void;

    applyLastNameFilter(qb: SelectQueryBuilder<User>, lastName: string): void;

    applyEmailFilter(qb: SelectQueryBuilder<User>, email: string): void;

    

}
