import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { Session } from '../../domain/entities/session.entity';
import type { ISessionRepository } from '../../domain/repositories/session.repository.interface';
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  /** Выполняет операцию в транзакции, блокируя сессию до её завершения. */
  async withLockedRefreshSession<T>(
    hash: string,
    operation: (session: Session | undefined, repository: ISessionRepository) => Promise<T>,
  ): Promise<T> {
    return this.repository.manager.transaction('READ COMMITTED', async (entityManager) => {
      const repository = entityManager.getRepository(Session);
      const session = await repository
        .createQueryBuilder('session')
        .setLock('pessimistic_write')
        .where('session.refreshTokenHash = :hash', { hash })
        .orWhere('session.previousRefreshTokenHash = :hash', { hash })
        .getOne();

      return operation(session ?? undefined, new SessionRepository(repository));
    });
  }

  async findActiveByAccessTokenHash(token: string): Promise<Session | null> {
    return this.repository.findOne({
      where: {
        accessToken: token,
        accessTokenValidUntil: MoreThan(new Date()),
        revokedAt: IsNull(),
      },
      relations: ['user', 'user.role', 'user.role.permissions'],
    });
  }

  async revokeAllForUser(userId: Uuid): Promise<void> {
    await this.repository.update(
      { userId: userId.toString(), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** Ищет сессию по текущему refresh-хешу независимо от срока и отзыва. */
  async findByRefreshTokenHash(hash: string): Promise<Session | undefined> {
    const session = await this.repository.findOne({
      where: { refreshTokenHash: hash },
      relations: ['user', 'user.role', 'user.role.permissions'],
    });

    return session ?? undefined;
  }

  /** Ищет сессию по предыдущему refresh-хешу, включая отозванные сессии. */
  async findByPreviousRefreshTokenHash(hash: string): Promise<Session | undefined> {
    const session = await this.repository
      .createQueryBuilder('session')
      .where('session.previousRefreshTokenHash = :hash', { hash })
      .getOne();

    return session ?? undefined;
  }

  /** Отзывает сессию, не перезаписывая уже зарегистрированный отзыв. */
  async revoke(sessionId: Uuid, reason: string): Promise<void> {
    await this.repository.update(
      { id: sessionId, revokedAt: IsNull() },
      { revokedAt: new Date(), revokedReason: reason },
    );
  }

  save(session: Session): Promise<Session> {
    return this.repository.save(session);
  }
}
