"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_entity_1 = require("./modules/users/entity/user.entity");
const users_module_1 = require("./modules/users/users.module");
const tournaments_module_1 = require("./modules/tournaments/tournaments.module");
const tournament_entity_1 = require("./Modules/tournaments/entities/tournament.entity");
const editors_entity_1 = require("./Modules/tournaments/entities/editors.entity");
const question_entity_1 = require("./Modules/tournaments/entities/question.entity");
const sourse_entity_1 = require("./Modules/tournaments/entities/sourse.entity");
const auth_module_1 = require("./modules/auth/auth.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                autoLoadEntities: true,
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: '***REMOVED***',
                password: '***REMOVED***',
                database: '***REMOVED***',
                entities: [tournament_entity_1.Tournament, user_entity_1.User, editors_entity_1.Editor, question_entity_1.Question, sourse_entity_1.Source],
                synchronize: true,
            }),
            users_module_1.UsersModule,
            tournaments_module_1.TournamentsModule,
            auth_module_1.AuthModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map