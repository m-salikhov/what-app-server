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
import { Transform } from 'class-transformer';

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'bigint' })
  @Transform(({ value }) => Number(value), { toPlainOnly: true })
  date: number;

  @Column()
  tours: number;

  @Column()
  questionsQuantity: number;

  @Column({ type: 'bigint' })
  @Transform(({ value }) => Number(value), { toPlainOnly: true })
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
