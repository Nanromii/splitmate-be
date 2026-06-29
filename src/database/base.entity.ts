import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryColumn,
  BeforeInsert,
  VersionColumn,
} from 'typeorm';
import { generateUuid } from '../common/utils/uuid.util';

export abstract class BaseEntity {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date | null;

  @Column({
    name: 'updated_at',
    type: 'uuid',
    nullable: true,
  })
  createdBy?: string | null;

  @Column({
    name: 'created_by',
    type: 'uuid',
    nullable: true,
  })
  updatedBy?: string | null;

  @Column({
    name: 'updated_by',
    type: 'uuid',
    nullable: true,
  })
  deletedBy?: string | null;

  @VersionColumn()
  version: number;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) {
      this.id = generateUuid();
    }
  }
}