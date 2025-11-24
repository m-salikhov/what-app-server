import { Injectable } from "@nestjs/common";
import { checkExist, getRandom } from "./Utils/wordle.util";

@Injectable()
export class WordleService {
	getRandomWord() {
		return getRandom();
	}

	checkWordExist(str: string) {
		return checkExist(str);
	}
}
