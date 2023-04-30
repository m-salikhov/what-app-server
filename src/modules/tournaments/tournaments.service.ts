import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionDto } from './dto/question.dto';
import { TournamentDto } from './dto/tournament.dto';
import { Editor } from './entities/editors.entity';
import { Question } from './entities/question.entity';
import { Source } from './entities/sourse.entity';
import { Tournament } from './entities/tournament.entity';
import parseLink from './helpers/parseLink';

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

  async createTournamet(tournament: TournamentDto) {
    const savedEditors: Editor[] = [];
    await Promise.all(
      tournament.editors.map(async (editor) => {
        const editorToSave = new Editor();
        editorToSave.name = editor;
        await this.editorRepo.save(editorToSave);
        savedEditors.push(editorToSave);
      }),
    );

    const savedQuestions: Question[] = [];
    for await (const question of tournament.questions) {
      const savedSources: Source[] = [];
      for await (const source of question.source) {
        const sourceToSave = new Source();
        sourceToSave.link = source;
        await this.sourceRepo.save(sourceToSave);
        savedSources.push(sourceToSave);
      }

      const newQuestion = this.questionRepo.create({
        ...question,
        source: savedSources,
      });
      const savedQuestion = await this.questionRepo.save(newQuestion);
      savedQuestions.push(savedQuestion);
    }

    const newTournament = this.tournamentRepo.create({
      ...tournament,
      editors: savedEditors,
      questions: savedQuestions,
    });
    const savedTournament = await this.tournamentRepo.save(newTournament);

    return savedTournament.id;
  }

  async createTournamentByLink(link: string) {
    return parseLink(link);
  }

  async getTournamentById(id: number) {
    const tournament = await this.tournamentRepo.findOne({
      where: { id },
      relations: ['editors', 'questions'],
    });
    return tournament
      ? this.normalizeTournament(tournament)
      : 'Tournament not found';
  }

  async getRandomQuestions(n: string) {
    const qb = this.questionRepo.createQueryBuilder('question');

    const randomIds = await qb
      .select('question.id')
      .orderBy('RAND()')
      .limit(+n)
      .getMany();

    const random = await Promise.all(
      randomIds.map(async (v) => {
        return await this.questionRepo.findOne({
          where: { id: v.id },
          relations: ['tournament'],
        });
      }),
    );

    return this.normalizeQuestions(random);
  }

  async getRandomTournaments(n: string) {
    const qb = this.tournamentRepo.createQueryBuilder('tournament');

    const randomTitles = await qb
      .select('tournament.title')
      .orderBy('RAND()')
      .limit(+n)
      .getMany();

    const randomTitlesNormalize = randomTitles.map((v) => v.title);

    return randomTitlesNormalize;
  }

  async getLastAddTournaments(n: number) {
    if (n === -1) {
      //Подсчитывает макс. число страниц
      const count = await this.tournamentRepo.count();
      const t = Math.trunc(count / 10);
      return count % 10 ? t + 1 : t;
    }
    const tournaments = await this.tournamentRepo.find({
      order: { dateUpload: 'DESC' },
      select: { title: true, dateUpload: true, id: true },
      skip: n,
      take: 10,
    });

    return tournaments;
  }

  async getAllTournamentsShort() {
    const tournaments = await this.tournamentRepo.find();
    return tournaments;
  }

  async getTournamentsByUploader(uploaderId: string) {
    const tournaments = await this.tournamentRepo.find({
      where: { uploaderUuid: uploaderId },
    });
    return tournaments;
  }

  normalizeQuestions(arr: Question[]): QuestionDto[] {
    return arr.map((el) => {
      const normSources = el.source.map((el) => el.link);
      return { ...el, source: normSources };
    });
  }

  normalizeEditors(editors: Editor[]): string[] {
    return editors.map((el) => el.name);
  }

  normalizeTournament(res: Tournament) {
    const normEditors = this.normalizeEditors(res.editors);
    const normQuestions = this.normalizeQuestions(res.questions);
    const tournament: TournamentDto = {
      ...res,
      editors: normEditors,
      questions: normQuestions,
    };
    return tournament;
  }
}
