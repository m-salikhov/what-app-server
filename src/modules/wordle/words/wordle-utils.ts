import { readFileSync } from "node:fs";

type Words = {
	[key: string]: string[];
};

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

const json: string = readFileSync("src/modules/wordle/words/hash-words.json", "utf-8");
const words: Words = JSON.parse(json);

export function getRandom() {
	const k = Object.keys(words);
	const rl = k[getRandomInt(k.length)];
	const word = words[rl][getRandomInt(words[rl].length)];
	return { word };
}

export function checkExist(word: string) {
	const isExist = words[word[0]] ? words[word[0]].includes(word) : false;
	return { isExist, word };
}
