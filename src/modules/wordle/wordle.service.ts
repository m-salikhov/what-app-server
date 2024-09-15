import { Injectable } from '@nestjs/common';
import { checkExist, getRandom } from './words/wordle-utils';

@Injectable()
export class WordleService {
  getRandomWord() {
    return getRandom();
  }

  checkWordExist(str: string) {
    return checkExist(str);
  }
}
