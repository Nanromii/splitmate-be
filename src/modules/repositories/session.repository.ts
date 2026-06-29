import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Session } from '../../database';

@Injectable()
export class SessionRepository extends Repository<Session> {
  constructor(private readonly dataSource: DataSource) {
    super(Session, dataSource.createEntityManager());
  }
}
