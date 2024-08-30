import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Source } from './source.entity';
import { Tournament } from './tournament.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: 'regular' })
  type: 'regular' | 'double' | 'triple' | 'other' | 'outside';
  @Column()
  qNumber: number;
  @Column()
  tourNumber: number;
  @Column({ default: '' })
  add: string;
  @Column({ type: 'mediumtext' })
  text: string;
  @Column({ type: 'mediumtext' })
  answer: string;
  @Column({ default: '' })
  alterAnswer?: string;
  @Column({ type: 'mediumtext' })
  comment: string;
  @Column()
  author: string;
  @OneToMany(() => Source, (source) => source.question, { eager: true })
  source: Source[];
  @ManyToOne(() => Tournament, (tournament) => tournament.questions, {
    onDelete: 'CASCADE',
  })
  tournament: Tournament;
}
