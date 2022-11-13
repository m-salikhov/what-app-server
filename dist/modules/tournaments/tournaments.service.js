"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const editors_entity_1 = require("./entities/editors.entity");
const question_entity_1 = require("./entities/question.entity");
const sourse_entity_1 = require("./entities/sourse.entity");
const tournament_entity_1 = require("./entities/tournament.entity");
let TournamentsService = class TournamentsService {
    constructor(tournamentRepo, editorRepo, questionRepo, sourceRepo) {
        this.tournamentRepo = tournamentRepo;
        this.editorRepo = editorRepo;
        this.questionRepo = questionRepo;
        this.sourceRepo = sourceRepo;
    }
    async createTournamet(tournament) {
        var e_1, _a, e_2, _b;
        const savedEditors = [];
        await Promise.all(tournament.editors.map(async (editor) => {
            const editorToSave = new editors_entity_1.Editor();
            editorToSave.name = editor;
            await this.editorRepo.save(editorToSave);
            savedEditors.push(editorToSave);
        }));
        const savedQuestions = [];
        try {
            for (var _c = __asyncValues(tournament.questions), _d; _d = await _c.next(), !_d.done;) {
                const question = _d.value;
                const savedSources = [];
                try {
                    for (var _e = (e_2 = void 0, __asyncValues(question.source)), _f; _f = await _e.next(), !_f.done;) {
                        const source = _f.value;
                        const sourceToSave = new sourse_entity_1.Source();
                        sourceToSave.link = source;
                        await this.sourceRepo.save(sourceToSave);
                        savedSources.push(sourceToSave);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) await _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                const newQuestion = this.questionRepo.create(Object.assign(Object.assign({}, question), { source: savedSources }));
                const savedQuestion = await this.questionRepo.save(newQuestion);
                savedQuestions.push(savedQuestion);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) await _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        const newTournament = this.tournamentRepo.create(Object.assign(Object.assign({}, tournament), { editors: savedEditors, questions: savedQuestions }));
        const savedTournament = await this.tournamentRepo.save(newTournament);
        return savedTournament.id;
    }
    async getTournamentById(id) {
        const tournament = await this.tournamentRepo.findOne({
            where: { id },
            relations: ['editors', 'questions'],
        });
        return tournament
            ? this.normalizeTournament(tournament)
            : 'Tournament not found';
    }
    async getRandomQuestions(n) {
        const qb = this.questionRepo.createQueryBuilder('question');
        const randomIds = await qb
            .select('question.id')
            .orderBy('RAND()')
            .limit(+n)
            .getMany();
        const random = await Promise.all(randomIds.map(async (v) => {
            return await this.questionRepo.findOne({
                where: { id: v.id },
                relations: ['tournament'],
            });
        }));
        return this.normalizeQuestions(random);
    }
    async getRandomTournaments(n) {
        const qb = this.tournamentRepo.createQueryBuilder('tournament');
        const randomTitles = await qb
            .select('tournament.title')
            .orderBy('RAND()')
            .limit(+n)
            .getMany();
        const randomTitlesNormalize = randomTitles.map((v) => v.title);
        return randomTitlesNormalize;
    }
    async getLastAddTournaments(n) {
        if (n === -1) {
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
    async getTournamentsByUploader(uploaderId) {
        const tournaments = await this.tournamentRepo.find({
            where: { uploaderUuid: uploaderId },
        });
        return tournaments;
    }
    normalizeQuestions(arr) {
        return arr.map((el) => {
            const normSources = el.source.map((el) => el.link);
            return Object.assign(Object.assign({}, el), { source: normSources });
        });
    }
    normalizeEditors(editors) {
        return editors.map((el) => el.name);
    }
    normalizeTournament(res) {
        const normEditors = this.normalizeEditors(res.editors);
        const normQuestions = this.normalizeQuestions(res.questions);
        const tournament = Object.assign(Object.assign({}, res), { editors: normEditors, questions: normQuestions });
        return tournament;
    }
};
TournamentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tournament_entity_1.Tournament)),
    __param(1, (0, typeorm_1.InjectRepository)(editors_entity_1.Editor)),
    __param(2, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(3, (0, typeorm_1.InjectRepository)(sourse_entity_1.Source)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TournamentsService);
exports.TournamentsService = TournamentsService;
//# sourceMappingURL=tournaments.service.js.map