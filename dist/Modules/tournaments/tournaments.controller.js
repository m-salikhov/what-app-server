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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const tournament_dto_1 = require("./dto/tournament.dto");
const tournaments_service_1 = require("./tournaments.service");
let TournamentsController = class TournamentsController {
    constructor(tournamentsService) {
        this.tournamentsService = tournamentsService;
    }
    async createTournament(tournament) {
        return this.tournamentsService.createTournamet(tournament);
    }
    async getAllTournamentsShort() {
        return this.tournamentsService.getAllTournamentsShort();
    }
    async getTournamentsByUploader(id) {
        return this.tournamentsService.getTournamentsByUploader(id);
    }
    async getLastTen(n) {
        return this.tournamentsService.getLastAddTournaments(+n);
    }
    async getRandomQuestions(n) {
        return this.tournamentsService.getRandomQuestions(n);
    }
    async getTournamentById(id) {
        return this.tournamentsService.getTournamentById(+id);
    }
    async getRandomTournaments(n) {
        return this.tournamentsService.getRandomTournaments(n);
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tournament_dto_1.TournamentDto]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "createTournament", null);
__decorate([
    (0, common_1.Get)('/allshort'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getAllTournamentsShort", null);
__decorate([
    (0, common_1.Get)('/allbyuploader/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getTournamentsByUploader", null);
__decorate([
    (0, common_1.Get)('/last/:n'),
    __param(0, (0, common_1.Param)('n')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getLastTen", null);
__decorate([
    (0, common_1.Get)('/random/:n'),
    __param(0, (0, common_1.Param)('n')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getRandomQuestions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getTournamentById", null);
__decorate([
    (0, common_1.Get)('/randomt/:n'),
    __param(0, (0, common_1.Param)('n')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TournamentsController.prototype, "getRandomTournaments", null);
TournamentsController = __decorate([
    (0, common_1.Controller)('tournaments'),
    __metadata("design:paramtypes", [tournaments_service_1.TournamentsService])
], TournamentsController);
exports.TournamentsController = TournamentsController;
//# sourceMappingURL=tournaments.controller.js.map