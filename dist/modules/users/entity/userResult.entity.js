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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultElem = exports.UserResult = void 0;
const typeorm_1 = require("typeorm");
let UserResult = class UserResult {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserResult.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", Number)
], UserResult.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserResult.prototype, "tournamentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserResult.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserResult.prototype, "tournamentLength", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserResult.prototype, "resultNumber", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ResultElem, (elem) => elem.userResult),
    __metadata("design:type", Array)
], UserResult.prototype, "result", void 0);
UserResult = __decorate([
    (0, typeorm_1.Entity)()
], UserResult);
exports.UserResult = UserResult;
let ResultElem = class ResultElem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ResultElem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ResultElem.prototype, "ans", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ResultElem.prototype, "num", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => UserResult, (res) => res.result, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", UserResult)
], ResultElem.prototype, "userResult", void 0);
ResultElem = __decorate([
    (0, typeorm_1.Entity)()
], ResultElem);
exports.ResultElem = ResultElem;
//# sourceMappingURL=userResult.entity.js.map