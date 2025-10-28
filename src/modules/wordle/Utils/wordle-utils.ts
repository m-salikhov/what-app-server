import { words } from "../Dictionary/wordleDictionary";

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

export function getRandom() {
	const letters = Object.keys(words);
	const randomLetter = letters[getRandomInt(letters.length)];
	const word = words[randomLetter][getRandomInt(words[randomLetter].length)];
	return { word };
}

export function checkExist(word: string) {
	const isExist = words[word[0]] ? words[word[0]].includes(word) : false;
	return { isExist, word };
}
