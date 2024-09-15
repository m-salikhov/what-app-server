import { readFileSync } from 'node:fs';

type Words = {
  [key: string]: string[];
};

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

const json: string = readFileSync(
  'src/modules/wordle/words/hash-words.json',
  'utf-8',
);
const words: Words = JSON.parse(json);

export function getRandom() {
  const k = Object.keys(words);
  const rl = k[getRandomInt(k.length)];
  const rw = words[rl][getRandomInt(words[rl].length)];
  return rw;
}

export function checkExist(str: string) {
  return words[str[0]].includes(str);
}
