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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entity/user.entity");
const get_user_dto_1 = require("./dto/get-user.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const userResult_entity_1 = require("./entity/userResult.entity");
let UsersService = class UsersService {
    constructor(userRepo, userResultRepo, resultElemRepo) {
        this.userRepo = userRepo;
        this.userResultRepo = userResultRepo;
        this.resultElemRepo = resultElemRepo;
    }
    async createUser(user) {
        const userCheck = await this.userRepo.findOne({
            where: { email: user.email },
        });
        if (userCheck)
            throw new common_1.ConflictException('Email уже существует в системе');
        const hash = await bcrypt.hash(user.password, 8);
        const newUser = Object.assign(Object.assign({}, user), { password: hash, date: Date.now() });
        console.log('user', newUser);
        return await this.userRepo.save(newUser);
    }
    async getUser(getUserDto) {
        let [key, value] = Object.entries(getUserDto)[0];
        const user = await this.userRepo.findOne({
            where: { [key]: value },
        });
        if (!user)
            throw new common_1.NotFoundException('user not found');
        return user;
    }
    async getUsernameByUUID(uuid) {
        const user = await this.userRepo.findOne({
            where: { id: uuid },
            select: { username: true },
        });
        return user.username;
    }
    async updatePassword(passworObj) {
        const user = await this.userRepo.findOne({ where: { id: passworObj.id } });
        const hash = await bcrypt.hash(passworObj.newPass, 10);
        await this.userRepo.save(Object.assign(Object.assign({}, user), { password: hash }));
        return 'Пароль изменён';
    }
    async createUserResult(userResultDto) {
        var e_1, _a;
        const resultCheck = await this.userResultRepo.findOne({
            where: {
                userId: userResultDto.userId,
                tournamentId: userResultDto.tournamentId,
            },
        });
        if (resultCheck)
            throw new common_1.ConflictException('Результат уже существует');
        const savedResultElems = [];
        let tours = Math.max(...Object.keys(userResultDto.result).map((v) => +v));
        for (let i = 1; i <= tours; i++) {
            try {
                for (var _b = (e_1 = void 0, __asyncValues(userResultDto.result[i])), _c; _c = await _b.next(), !_c.done;) {
                    const resultElem = _c.value;
                    let resultElemToSave = new userResult_entity_1.ResultElem();
                    resultElemToSave = Object.assign(Object.assign(Object.assign({}, resultElemToSave), resultElem), { tour: i });
                    let savedElem = await this.resultElemRepo.save(resultElemToSave);
                    console.log('savedElem', savedElem);
                    savedResultElems.push(savedElem);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        const newUserResult = Object.assign(Object.assign({}, userResultDto), { result: savedResultElems, date: Date.now() });
        return await this.userResultRepo.save(newUserResult);
    }
    async getUserResultShort(id) {
        let result = await this.userResultRepo.find({
            where: { userId: id },
        });
        return result;
    }
    async getUserResultFull(id) {
        const res = await this.userResultRepo.find({
            where: { userId: id },
            relations: ['result'],
            select: {
                result: {
                    ans: true,
                    num: true,
                },
            },
        });
        return res;
    }
    async deleteUser(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('user not found');
        return await this.userRepo.remove(user);
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_user_dto_1.updatePassDto]),
    __metadata("design:returntype", Promise)
], UsersService.prototype, "updatePassword", null);
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(userResult_entity_1.UserResult)),
    __param(2, (0, typeorm_1.InjectRepository)(userResult_entity_1.ResultElem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map