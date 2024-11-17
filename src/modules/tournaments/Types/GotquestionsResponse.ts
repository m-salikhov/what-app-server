export interface GotquestionsPerson {
  id: number;
  name: string;
  gender: string;
}

interface Controversial {
  id: number;
  answer: string;
  status: string;
  comment: string;
  appealJuryComment: string;
}

interface Question {
  id: number;
  number: number;
  text: string;
  razdatkaText: string;
  razdatkaPic: string;
  audio: string;
  commentAudio: string;
  answer: string;
  answerPic: string;
  zachet: string;
  nezachet: string;
  comment: string;
  note: string;
  commentPic: string;
  source: string;
  authors: GotquestionsPerson[];
  editors: GotquestionsPerson[];
  tour: Omit<Tour, 'info' | 'editors' | 'questions'>;
  packId: number;
  packTitle: string;
  controversials: Controversial[];
  appeals: [];
  teams: number;
  aTeams: number;
  sTeams: number;
  correctAnswers: number;
  sCorrectAnswers: number;
  aCorrectAnswers: number;
  complexity: string;
  aComplexity: string;
  sComplexity: string;
  totalLikes: number;
  totalDislikes: number;
  pubDate: string;
  endDate: string;
  uploader: number;
  tags: [];
  takenDown: boolean;
  marked: boolean;
  gNum: number;
}

interface Tour {
  id: number;
  number: number;
  title: string;
  info: string;
  editors: GotquestionsPerson[];
  questions: Question[];
}

export interface Pack {
  id: number;
  title: string;
  longTitle: string;
  startDate: string;
  endDate: string;
  pubDate: string;
  editors: GotquestionsPerson[];
  tours: Tour[];
  questions: number;
  info: string;
  sTeams: number;
  syncronId: number;
  asyncronId: number;
  published: boolean;
  dbchgkinfoslug: string;
  aTeams: number;
  trueDl: number[];
  totalLikes: number;
  totalDislikes: number;
  uploader: number;
  discussionURL: string;
}

export interface GotquestionsResponse {
  pageProps: {
    pack: Pack;
  };
  __N_SSG: boolean;
}
