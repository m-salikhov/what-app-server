import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Tournament } from './tournament.entity';

@Entity()
export class Editor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
