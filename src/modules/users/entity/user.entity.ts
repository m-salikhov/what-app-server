import { Exclude, Transform } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	username: string;

	@Column()
	role: "user" | "admin";

	@Column()
	email: string;

	@Exclude()
	@Column()
	password: string;

	@Column({ type: "varchar" })
	@Transform(({ value }) => Number(value), { toPlainOnly: true })
	date: number;
}
