import { TournamentDto } from '../dto/tournament.dto';
import { Pack } from '../Types/GotquestionsResponse';

function extractAuthorsNames(authors: any[]) {
  if (authors.length === 0) return 'автор не указан';

  return authors.map((a) => a.name).join(', ');
}

function splitSourceString(sources: string) {
  if (!sources.startsWith('1. ')) return [sources];

  return sources.split(/\n/).map((s) => s.slice(3));
}

function normalizeGotquestionsQuestions(tours: Pack['tours']) {
  const questions: TournamentDto['questions'] = [];

  for (const tour of tours) {
    tour.questions.forEach((q) => {
      if (q.number < 1) return;

      const add = q.razdatkaPic
        ? `https://gotquestions.online${q.razdatkaPic}`
        : q.razdatkaText;

      questions[q.number - 1] = {
        qNumber: q.number,
        tourNumber: tour.number,
        text: q.text,
        answer: q.answer,
        author: extractAuthorsNames(q.authors),
        source: splitSourceString(q.source),
        comment: q.comment,
        alterAnswer: q.zachet,
        type: 'regular',
        add,
      };
    });
  }

  return questions;
}

export function normalizeGotquestionsTournament(pack: Pack) {
  const questions = normalizeGotquestionsQuestions(pack.tours);

  const t: TournamentDto = {
    title: pack.title,
    questionsQuantity: questions.length,
    date: new Date(pack.startDate).getTime(),
    tours: pack.tours.length,
    editors: pack.editors.map((e) => e.name),
    uploader: '',
    uploaderUuid: '',
    link: '',
    dateUpload: 0,
    questions,
  };

  return t;
}
