import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LoginStat {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: '' })
  ip: string;
  @Column({ default: '' })
  username: string;
  @Column({ default: '' })
  userID: string;
  @Column({ default: '' })
  timestamp: string;
}
