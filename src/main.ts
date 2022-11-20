import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync('~/what-server/what-app-server/src/secret/key.pem'),
  cert: fs.readFileSync('~/what-server/what-app-server/src/secret/cert.pem'),
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
