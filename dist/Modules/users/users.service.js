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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entity/user.entity");
const get_user_dto_1 = require("./dto/get-user.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
let UsersService = class UsersService {
    constructor(userRepo) {
        this.userRepo = userRepo;
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map