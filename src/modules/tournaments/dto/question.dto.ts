export class QuestionDto {
  type: 'regular' | 'double' | 'triple' | 'other' | 'outside';
  qNumber: number;
  tourNumber: number;
  add?: string;
  text: string;
  answer: string;
  alterAnswer?: string;
  comment?: string;
  author: string;
  source: {
    id: number;
    link: string;
  }[];
}
