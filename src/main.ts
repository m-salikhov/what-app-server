import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { join } from 'path';

// const httpsOptions = {
//   // key: fs.readFileSync(join(process.cwd(), './src/secret/key.pem')).toString(),
//   key: fs.readFileSync('src/secret/key.pem'),
//   cert: fs
//     .readFileSync(join(process.cwd(), './src/secret/cert.pem'))
//     .toString(),
// };

async function bootstrap() {
  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: [
      'https://localhost:3000',
      'https://62.217.179.200:3000',
      'http://62.217.179.200:3000',
      'https://62.217.179.200',
      'http://62.217.179.200',
      'https://sage-paletas-ab37e6.netlify.app',
      'http://sage-paletas-ab37e6.netlify.app',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
