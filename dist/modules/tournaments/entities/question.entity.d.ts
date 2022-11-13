import { Source } from './sourse.entity';
import { Tournament } from './tournament.entity';
export declare class Question {
    id: number;
    type: 'regular' | 'double' | 'triple' | 'other' | 'outside';
    qNumber: number;
    tourNumber: number;
    add: string;
    text: string;
    answer: string;
    alterAnswer?: string;
    comment: string;
    author: string;
    source: Source[];
    tournament: Tournament;
}
