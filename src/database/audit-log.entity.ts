import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { AuditAction } from "../common/enums";

@Entity('audit_logs')
@Index(
  'idx_audit_logs_entity',
  ['entityType', 'entityId'],
)
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_audit_logs_actor_id')
  @Column({
    name: 'actor_id',
    nullable: true,
  })
  actorId?: string;

  @Column({
    name: 'entity_type',
    length: 100,
  })
  entityType: string;

  @Column({
    name: 'entity_id',
  })
  entityId: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'old_value',
  })
  oldValue?: Record<string, any>;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'new_value',
  })
  newValue?: Record<string, any>;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;
}