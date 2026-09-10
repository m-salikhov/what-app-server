interface Person {
	id: number;
	slug: string;
	name: string;
	copyrightId: number | null;
	namesakes: boolean;
	gender: string;
	playerId: number;
	alias: string[];
	createdAt: string;
}

interface Author {
	questionId: number;
	personId: number;
	person: Person;
}

interface Controversial {
	id: number;
	question_number: number;
	answer: string;
	status: string; // "A", "D" etc.
	comment: string | null;
	appealJuryComment: string | null;
}

interface Appeal {
	id: number;
	idtournament: number;
	question_number: number;
	type: string; // "A", "R" etc.
	status: string; // "A", "D" etc.
	appeal: string;
	comment: string;
	answer: string;
	tournament: {
		id: number;
		name: string;
		endDate: string;
	};
	azh: Array<{
		id: number;
		name: string;
		surname: string;
		patronymic: string;
	}>;
}

interface Question {
	id: number;
	number: number;
	text: string;
	razdatkaText: string;
	razdatkaPic: string;
	audio: string;
	razdatkaPicGeneric: string;
	answer: string;
	answerPic: string;
	zachet: string;
	nezachet: string;
	comment: string;
	note: string;
	commentPic: string;
	commentAudio: string;
	source: string;
	ordering: number;
	takenDown: boolean;
	marked: boolean;
	correctAnswers: number[]; // может быть пустым
	complexity: string[]; // может быть пустым
	teamsCount: number[]; // может быть пустым
	tourId: number;
	authors: Author[];
	controversials?: Controversial[];
	appeals?: Appeal[];
	likesCount?: number; // не у всех вопросов
}

interface Editor {
	tourId?: number; // в турах внутри tours может быть editor с tourId
	packId?: number; // в корневом editors есть packId
	personId: number;
	person: Person;
}

interface Tour {
	id: number;
	number: number;
	title: string;
	packId: number;
	info: string;
	ordering: number;
	questions: Question[];
	editors: Editor[]; // обычно пустой массив
}

interface LegacyTournament {
	id: number;
	name: string;
	teamsCount: number;
}

export interface Pack {
	id: number;
	slug: string;
	title: string;
	longTitle: string;
	startDate: string;
	endDate: string;
	pubDate: string;
	dbchgkinfoslug: string;
	iqgaid: number;
	info: string;
	tIds: number[];
	truedls: number[];
	teams: number[];
	published: boolean;
	adultOnly: boolean;
	uploaderId: number;
	discussionURL: string;
	tours: Tour[];
	editors: Editor[];
	legacyTournaments: LegacyTournament[];
	likesCount: number;
}
