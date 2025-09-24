import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question.entity";

@Entity()
export class Source {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "mediumtext" })
	link: string;

	@ManyToOne(
		() => Question,
		(question) => question.source,
		{
			onDelete: "CASCADE",
			nullable: true,
		},
	)
	question?: Question;
}
