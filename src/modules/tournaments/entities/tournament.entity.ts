import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Editor } from './editors.entity';
import { Question } from './question.entity';

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column({ type: 'bigint' })
  date: number;
  @Column()
  tours: number;
  @Column()
  questionsQuantity: number;
  @Column({ type: 'bigint' })
  dateUpload: number;
  @Column()
  uploaderUuid: string;
  @Column()
  uploader: string;
  @Column({ default: '' })
  link: string;
  @OneToMany(() => Question, (question) => question.tournament)
  questions: Question[];
  @ManyToMany(() => Editor)
  @JoinTable()
  editors: Editor[];
}
