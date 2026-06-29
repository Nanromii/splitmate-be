import { Entity, BaseEntity, Column, Index } from 'typeorm';
import { FileEntityType } from '../common/enums';

@Entity('files')
export class File extends BaseEntity {
  @Column({
    name: 'file_name',
    length: 255,
  })
  fileName: string;

  @Column({
    name: 'mime_type',
    length: 100,
  })
  mimeType: string;

  @Column({
    type: 'bigint',
  })
  size: number;

  @Column({
    type: 'text',
  })
  url: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: FileEntityType,
  })
  entityType: FileEntityType;

  @Index('idx_files_entity_id')
  @Column({
    name: 'entity_id',
  })
  entityId: string;

  @Index('idx_files_uploaded_by')
  @Column({
    name: 'uploaded_by',
    nullable: true,
  })
  uploadedBy?: string;
}
