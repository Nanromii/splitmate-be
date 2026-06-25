import { Entity, BaseEntity, Index, Column, ManyToOne, JoinColumn } from "typeorm";
import { NotificationType } from "../common/enums";
import { User } from "./user.entity";

@Entity('notifications')
export class Notification extends BaseEntity {
  @Index('idx_notifications_user_id')
  @Column({
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
  })
  body: string;

  @Column({
    default: false,
    name: 'is_read',
  })
  isRead: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  payload?: Record<string, any>;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}