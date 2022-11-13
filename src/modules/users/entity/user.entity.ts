import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  username: string;
  @Column()
  role: 'user' | 'superuser' | 'admin';
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ type: 'varchar' })
  date: number;
}
