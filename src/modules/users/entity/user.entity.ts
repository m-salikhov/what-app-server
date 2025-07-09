import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Transform } from 'class-transformer';

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

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'varchar' })
  @Transform(({ value }) => Number(value), { toPlainOnly: true })
  date: number;
}
