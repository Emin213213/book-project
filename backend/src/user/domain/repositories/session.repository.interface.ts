import { Session } from '../entities/session.entity';
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface ISessionRepository {
  /**
   * Выполняет операцию с блокировкой сессии по текущему или предыдущему refresh-хешу.
   * Все изменения внутри operation должны использовать переданный репозиторий.
   * Возвращённый результат фиксирует транзакцию, исключение откатывает её.
   */
  withLockedRefreshSession<T>(
    hash: string,
    operation: (session: Session | undefined, repository: ISessionRepository) => Promise<T>,
  ): Promise<T>;

  save(session: Session): Promise<Session>;

  findActiveByAccessTokenHash(hash: string): Promise<Session | null>;
  /** Ищет сессию по текущему refresh-хешу, включая отозванные сессии. */
  findByRefreshTokenHash(hash: string): Promise<Session | undefined>;

  /** Ищет сессию по предыдущему refresh-хешу для обнаружения повторного использования. */
  findByPreviousRefreshTokenHash(hash: string): Promise<Session | undefined>;

  /** Отзывает активную сессию, сохраняя причину первого отзыва. */
  revoke(sessionId: Uuid, reason: string): Promise<void>;

  revokeAllForUser(userId: Uuid): Promise<void>;
}
