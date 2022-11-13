import { QuestionDto } from './question.dto';
export declare class TournamentDto {
    id?: number;
    title: string;
    date: number;
    questionsQuantity: number;
    tours: number;
    questions: QuestionDto[];
    editors: string[];
    dateUpload: number;
    uploaderUuid: string;
    uploader: string;
}
export declare class getTournametDto {
    title?: string;
    date?: number;
    editor?: string;
    maxDateUpload?: number;
    minDateUploader?: number;
}
