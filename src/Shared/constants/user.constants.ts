import { UserWithoutPassword } from "../Types/UserWithoutPassword.type";

export const guestAccount: UserWithoutPassword = {
	id: "954bd063-43d9-428b-aa3f-a716ad7aca7e",
	username: "guest",
	role: "guest",
	email: "",
	date: new Date("2000-01-01"),
} as const;

export const publicAccount: UserWithoutPassword = {
	id: "9c109535-51f9-461b-9029-a4898378ce58",
	username: "PublicAcc",
	email: "test@test.com",
	role: "user",
	date: new Date("2000-01-01"),
} as const;
