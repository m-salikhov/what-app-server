import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TournamentDto } from './dto/tournament.dto';
import { TournamentsService } from './tournaments.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SelfGuard } from '../auth/guards/role.guard';

@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly tournamentsService: TournamentsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async createTournament(@Body() tournament: TournamentDto) {
    return this.tournamentsService.createTournament(tournament);
  }

  @Post('/create-by-link')
  async parseTournamentByLink(@Body('link') link: string) {
    if (!link.includes('gotquestions.online'))
      throw new BadRequestException(
        'Ссылка должна вести на https://www.gotquestions.online',
      );

    return this.tournamentsService.parseTournamentByLinkGotquestions(link);
  }

  @Get('/all-short')
  async getAllTournamentsShort() {
    return this.tournamentsService.getAllTournamentsShort();
  }

  @UseGuards(JwtAuthGuard, SelfGuard)
  @Get('/all-by-uploader/:uuid')
  async getTournamentsByUploader(@Param('uuid') uuid: string) {
    return this.tournamentsService.getTournamentsByUploader(uuid);
  }

  @Get('/last')
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

  @Get('/random-tournament')
  async getRandomTournament(@Query('userId') userId: string) {
    return this.tournamentsService.getRandomTournament(userId);
  }

  @Get('/statistics')
  async getStatistics() {
    return this.tournamentsService.getStatistics();
  }

  @Get(':id')
  async getTournamentById(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.getTournamentById(id);
  }

  @Post('/dev')
  async getUser(
    @Body()
    data: {
      id: number;
      link: string;
      title: string;
      difficulty: number;
    }[],
  ) {
    if (this.configService.get('NODE_ENV') !== 'development') {
      throw new ForbiddenException(
        'This route is only available in development mode',
      );
    }
    return this.tournamentsService.dev(data);
  }
}
