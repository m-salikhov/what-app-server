import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question.entity";

@Entity()
export class AddMetadata {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	width: number;

	@Column()
	height: number;

	@Column({ length: 50 })
	type: string;

	@OneToOne(
		() => Question,
		(question) => question.addMetadata,
		{
			onDelete: "CASCADE",
		},
	)
	@JoinColumn({ name: "question_id" })
	question?: Question;
}
