import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Source } from "./source.entity";
import { Tournament } from "./tournament.entity";
import { AddMetadata } from "./add-metadata.entity";

@Entity()
export class Question {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ default: "regular" })
	type: "regular" | "double" | "triple" | "other" | "outside";

	@Column()
	qNumber: number;

	@Column()
	tourNumber: number;

	@Column({ type: "varchar", length: 2000, default: "" })
	add: string;

	@Column({ type: "varchar", length: 6000, default: "" })
	text: string;

	@Column({ type: "varchar", length: 1000, default: "" })
	answer: string;

	@Column({ type: "varchar", length: 1000, default: "" })
	alterAnswer: string;

	@Column({ type: "varchar", length: 6000, default: "" })
	comment: string;

	@Column()
	author: string;

	@Column({ length: 24 })
	answerRatio: string;

	@OneToMany(
		() => Source,
		(source) => source.question,
		{
			eager: true,
			cascade: ["insert", "update"],
			onDelete: "CASCADE",
		},
	)
	source: Source[];

	@ManyToOne(
		() => Tournament,
		(tournament) => tournament.questions,
		{
			onDelete: "CASCADE",
		},
	)
	tournament?: Tournament;

	@OneToOne(
		() => AddMetadata,
		(addMetadata) => addMetadata.question,
		{
			eager: true,
			cascade: ["insert", "update"],
			onDelete: "CASCADE",
		},
	)
	addMetadata: AddMetadata | null;
}
