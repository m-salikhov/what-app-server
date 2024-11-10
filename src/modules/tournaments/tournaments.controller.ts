import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { TournamentDto } from './dto/tournament.dto';
import { TournamentsService } from './tournaments.service';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTournament(@Body() tournament: TournamentDto) {
    return this.tournamentsService.createTournament(tournament);
  }

  @Post('/quest')
  async createTournamentByQuest(@Body() tournament: TournamentDto) {
    return this.tournamentsService.createTournament(tournament);
  }

  @Post('/createbylink')
  async parseTournamentByLink(@Body('link') link: string) {
    if (link.includes('gotquestions')) {
      return this.tournamentsService.parseTournamentByLinkGotquestions(link);
    } else if (link.includes('db.chgk.info')) {
      return this.tournamentsService.parseTournamentByLinkDbchgk(link);
    } else {
      throw new BadRequestException(
        'Ссылка должна вести на https://db.chgk.info или https://www.gotquestions.online',
      );
    }
  }

  @Get('/allshort')
  async getAllTournamentsShort() {
    return this.tournamentsService.getAllTournamentsShort();
  }

  @Get('/allbyuploader/:uuid')
  async getTournamentsByUploader(@Param('uuid') uuid: string) {
    return this.tournamentsService.getTournamentsByUploader(uuid);
  }

  @Get('/last/last?')
  async getLastTen(
    @Query('amount', ParseIntPipe) amount: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('withSkip', ParseBoolPipe) withSkip: boolean,
  ) {
    return this.tournamentsService.getLastAddTournaments(
      amount,
      page,
      withSkip,
    );
  }

  @Get('/random/:n')
  async getRandomQuestions(@Param('n', ParseIntPipe) n: number) {
    return this.tournamentsService.getRandomQuestions(n);
  }

  @Get('/statistics')
  async getStatistics() {
    return this.tournamentsService.getStatistics();
  }

  @Get(':id')
  async getTournamentById(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.getTournamentById(id);
  }

  @Get('/randomt/:n')
  async getRandomTournaments(@Param('n', ParseIntPipe) n: number) {
    return this.tournamentsService.getRandomTournaments(n);
  }
}
