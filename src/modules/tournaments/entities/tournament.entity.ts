import { Exclude } from "class-transformer";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Editor } from "./editors.entity";
import { Question } from "./question.entity";

@Entity()
export class Tournament {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column({ type: "date" })
	date: Date;

	@Column()
	tours: number;

	@Column()
	questionsQuantity: number;

	@Column({ type: "date" })
	dateUpload: Date;

	@Exclude()
	@Column()
	uploaderUuid: string;

	@Column()
	uploader: string;

	@Column()
	status: "published" | "draft";

	@Column({ default: "" })
	link: string;

	@Column({ type: "float", default: -1 })
	difficulty: number;

	@OneToMany(
		() => Question,
		(question) => question.tournament,
	)
	questions: Question[];

	@ManyToMany(() => Editor)
	@JoinTable()
	editors: Editor[];
}
