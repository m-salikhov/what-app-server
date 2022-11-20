"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path_1 = require("path");
const httpsOptions = {
    key: fs.readFileSync('src/secret/key.pem'),
    cert: fs.readFileSync((0, path_1.join)(process.cwd(), './src/secret/key.pem')).toString(),
};
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { httpsOptions });
    app.use(cookieParser());
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });
    await app.listen(process.env.PORT || 5000);
}
bootstrap();
//# sourceMappingURL=main.js.map