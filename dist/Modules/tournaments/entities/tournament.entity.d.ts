import { Editor } from './editors.entity';
import { Question } from './question.entity';
export declare class Tournament {
    id: number;
    title: string;
    date: number;
    tours: number;
    questionsQuantity: number;
    dateUpload: number;
    uploaderUuid: string;
    uploader: string;
    questions: Question[];
    editors: Editor[];
}
