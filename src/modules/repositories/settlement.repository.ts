import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Settlement } from '../../database';

@Injectable()
export class SettlementRepository extends Repository<Settlement> {
  constructor(private readonly dataSource: DataSource) {
    super(Settlement, dataSource.createEntityManager());
  }
}
