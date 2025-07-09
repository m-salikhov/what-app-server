import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  date: number;

  @Column()
  tournamentId: number;

  @Column()
  title: string;

  @Column()
  tournamentLength: number;

  @Column()
  resultNumber: number;

  @OneToMany(() => ResultElem, (elem) => elem.userResult)
  result: ResultElem[];
}

@Entity()
export class ResultElem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ans: boolean;

  @Column()
  num: number;

  @Column({ default: 0 })
  tour: number;

  @ManyToOne(() => UserResult, (res) => res.result, {
    onDelete: 'CASCADE',
  })
  userResult: UserResult;
}
