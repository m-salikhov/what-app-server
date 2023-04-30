import { QuestionDto } from '../dto/question.dto';
import { TournamentDto } from '../dto/tournament.dto';
import { Editor } from '../entities/editors.entity';
import { Question } from '../entities/question.entity';
import { Tournament } from '../entities/tournament.entity';

export function normalizeQuestions(arr: Question[]): QuestionDto[] {
  return arr.map((el) => {
    const normSources = el.source.map((el) => el.link);
    return { ...el, source: normSources };
  });
}

// export function normalizeEditors(editors: Editor[]): string[] {
//   return editors.map((el) => el.name);
// }

// export function normalizeTournament(res: Tournament) {
//   const normEditors = normalizeEditors(res.editors);
//   const normQuestions = normalizeQuestions(res.questions);
//   const tournament: TournamentDto = {
//     ...res,
//     editors: normEditors,
//     questions: normQuestions,
//   };
//   return tournament;
// }
