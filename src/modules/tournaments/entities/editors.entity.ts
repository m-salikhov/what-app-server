import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class Editor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
