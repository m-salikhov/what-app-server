import { Controller, Get, Query } from '@nestjs/common';
import { WordleService } from './wordle.service';

@Controller('wordle')
export class WordleController {
  constructor(private readonly wordleService: WordleService) {}

  @Get('/random-word')
  getUserResultShort() {
    return this.wordleService.getRandomWord();
  }

  @Get('/check-exist/check?')
  checkWordExist(@Query('word') word: string) {
    return this.wordleService.checkWordExist(word);
  }
}
