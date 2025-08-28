import { Controller, Get, Query } from '@nestjs/common';
import { WordleService } from './wordle.service';

@Controller('wordle')
export class WordleController {
  constructor(private readonly wordleService: WordleService) {}

  @Get('/random-word')
  getRandomWord() {
    return this.wordleService.getRandomWord();
  }

  @Get('/check-exist')
  checkWordExist(@Query('word') word: string) {
    return this.wordleService.checkWordExist(word);
  }
}
