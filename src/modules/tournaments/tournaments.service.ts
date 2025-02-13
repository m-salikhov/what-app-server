import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionDto } from './dto/question.dto';
import { TournamentDto } from './dto/tournament.dto';
import { Editor } from './entities/editors.entity';
import { Question } from './entities/question.entity';
import { Source } from './entities/source.entity';
import { Tournament } from './entities/tournament.entity';
import getHTML from './helpers/getHTML';
import parseTournamentHTML from './helpers/parseLink';
import { parseTournamentGotquestions } from './helpers/parseLinkGotquestions';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentRepo: Repository<Tournament>,
    @InjectRepository(Editor)
    private editorRepo: Repository<Editor>,
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(Source)
    private sourceRepo: Repository<Source>,
  ) {}

  async createTournament(tournament: TournamentDto) {
    const savedEditors: Editor[] = [];
    await Promise.all(
      tournament.editors.map(async (editor) => {
        const editorToSave = new Editor();
        editorToSave.name = editor.name;
        await this.editorRepo.save(editorToSave);
        savedEditors.push(editorToSave);
      }),
    );

    const savedQuestions: Question[] = [];
    for (const question of tournament.questions) {
      const savedSources: Source[] = [];
      for (const source of question.source) {
        const sourceToSave = new Source();
        sourceToSave.link = source.link;
        await this.sourceRepo.save(sourceToSave);
        savedSources.push(sourceToSave);
      }

      const { id, ...questionWithoutId } = question;

      const newQuestion = this.questionRepo.create({
        ...questionWithoutId,
        source: savedSources,
      });
      const savedQuestion = await this.questionRepo.save(newQuestion);
      savedQuestions.push(savedQuestion);
    }

    const newTournament = this.tournamentRepo.create({
      ...tournament,
      dateUpload: Date.now(),
      editors: savedEditors,
      questions: savedQuestions,
    });
    const savedTournament = await this.tournamentRepo.save(newTournament);

    return savedTournament.id;
  }

  async parseTournamentByLinkDbchgk(link: string) {
    const tournamentCheck = await this.tournamentRepo.findOne({
      where: { link },
    });
    if (tournamentCheck)
      throw new ConflictException('Турнир уже существует в системе');

    try {
      const tournamentHTML = await getHTML(link);
      const parsedTournament = await parseTournamentHTML(tournamentHTML);
      return { ...parsedTournament, link };
    } catch (error) {
      throw new BadRequestException(
        'Не удаётся распарсить турнир, проверьте ссылку',
      );
    }
  }

  async parseTournamentByLinkGotquestions(link: string) {
    const tournamentCheck = await this.tournamentRepo.findOne({
      where: { link },
    });

    if (tournamentCheck)
      throw new ConflictException('Турнир уже существует в системе');

    try {
      const tournament = await parseTournamentGotquestions(link);
      return tournament;
    } catch (error) {
      console.log(error);

      throw new BadRequestException(
        'Не удаётся распарсить турнир, проверьте ссылку',
      );
    }
  }

  async getTournamentById(id: number) {
    const tournament = await this.tournamentRepo.findOne({
      where: { id },
      relations: ['editors', 'questions'],
    });

    return tournament ? tournament : 'Турнир не найден';
  }

  async getRandomQuestions(n: number) {
    const qb = this.questionRepo.createQueryBuilder('question');

    const randomIds = await qb
      .select('question.id')
      .orderBy('RAND()')
      .limit(n)
      .getMany();

    const random = await Promise.all(
      randomIds.map((v) => {
        return this.questionRepo.findOne({
          where: { id: v.id },
          relations: ['tournament'],
        });
      }),
    );

    return random;
  }

  async getRandomTournaments(n: number) {
    const qb = this.tournamentRepo.createQueryBuilder('tournament');

    const randomTitles = await qb
      .select('tournament.title')
      .orderBy('RAND()')
      .limit(n)
      .getMany();

    const randomTitlesNormalize = randomTitles.map((v) => v.title);

    return randomTitlesNormalize;
  }

  async getLastAddTournaments(amount: number, page: number, withSkip: boolean) {
    const repo = this.tournamentRepo;
    const skip = (page - 1) * amount;

    const tournaments = await repo.find({
      order: { dateUpload: 'DESC' },
      skip: withSkip ? skip : 0,
      take: withSkip ? amount : amount * page,
    });

    const count = await repo.count();

    const pageCount = Math.ceil(count / amount);

    const hasMorePage = page < pageCount;

    return { tournaments, count, pageCount, hasMorePage };
  }

  async getAllTournamentsShort() {
    const tournaments = await this.tournamentRepo.find({
      order: { dateUpload: 'DESC' },
    });
    return tournaments;
  }

  async getTournamentsByUploader(uploaderId: string) {
    const tournaments = await this.tournamentRepo.find({
      where: { uploaderUuid: uploaderId },
      order: { dateUpload: 'DESC' },
    });
    return tournaments;
  }

  async getStatistics() {
    const tc = await this.tournamentRepo.count();
    const qc = await this.questionRepo.count();

    return { tc, qc };
  }
}
