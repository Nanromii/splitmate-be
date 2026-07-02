import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RevokeReason, SessionStatus } from '../../common/enums';
import { Session } from '../../database';

@Injectable()
export class SessionRepository extends Repository<Session> {
  constructor(private readonly dataSource: DataSource) {
    super(Session, dataSource.createEntityManager());
  }

  findByIdWithUserAndRefreshTokenHash(
    sessionId: string,
  ): Promise<Session | null> {
    return this.createQueryBuilder('session')
      .addSelect('session.refreshTokenHash')
      .leftJoinAndSelect('session.user', 'user')
      .where('session.id = :sessionId', { sessionId })
      .getOne();
  }

  findByIdWithUser(sessionId: string): Promise<Session | null> {
    return this.findOne({
      where: {
        id: sessionId,
      },
      relations: {
        user: true,
      },
    });
  }

  findByIdAndUserId(
    sessionId: string,
    userId: string,
  ): Promise<Session | null> {
    return this.findOne({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  findByUserIdOrderByCreatedAtDesc(userId: string): Promise<Session[]> {
    return this.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async revokeAllActiveByUserId(userId: string): Promise<void> {
    await this.createQueryBuilder()
      .update(Session)
      .set({
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokeReason: RevokeReason.LOGOUT_ALL,
      })
      .where('user_id = :userId', { userId })
      .andWhere('status = :status', { status: SessionStatus.ACTIVE })
      .andWhere('revoked_at IS NULL')
      .execute();
  }
}
