import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OpenStat {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: '' })
  ip: string;
  @Column({ default: '' })
  userAgent: string;
  @Column({ default: '' })
  host: string;
  @Column({ default: '' })
  timestamp: string;
}
