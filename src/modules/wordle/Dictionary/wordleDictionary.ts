import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Logger } from "@nestjs/common";

type Words = {
	[key: string]: string[];
};

let words: Words;

try {
	const filePath = join(__dirname, "hash-words.json");
	const json = readFileSync(filePath, "utf-8");
	words = JSON.parse(json);

	Logger.log("Wordle dictionary initialized successfully", "WordleDictionary");
} catch (error) {
	if (error instanceof Error) {
		Logger.error(
			`Ошибка при загрузке hash-words.json: ${error.message}`,
			error.stack,
			"WordleDictionary",
		);
	}

	throw new Error("Wordle dictionary initialization failed");
}

export { words };
