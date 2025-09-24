import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Editor {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
}
