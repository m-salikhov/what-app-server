"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const uuid_1 = require("uuid");
let AppService = exports.AppService = class AppService {
    getHello() {
        return ['hello world'];
    }
    async test(link) {
        const downloadImage = async (url, path) => {
            const response = await fetch(url);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs_1.promises.writeFile(path, buffer);
        };
        if (link.includes('imgur')) {
            link = link + '.png';
        }
        const fileName = 'andvarif-' + (0, uuid_1.v4)().slice(1, 13) + '.png';
        await downloadImage(link, `./public/${fileName}`);
        return [`${process.env.HOST}:${process.env.PORT}/public/${fileName}`];
    }
};
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map