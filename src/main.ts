import { Logger } from "@nestjs/common";
import * as dotenv from "dotenv";

dotenv.config();

import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { json } from "body-parser";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser());
	app.use(json({ limit: "50mb" }));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: false,
			transform: true,
		}),
	);

	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

	app.enableCors({
		origin: ["http://localhost:5173", "https://4gk-base.andvarif.ru", "https://andvarif.ru"],
		credentials: true,
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		allowedHeaders: "Content-Type, Accept, Authorization",
	});

	await app.listen(process.env.PORT || 3000);
	Logger.log(`Server started on port ${process.env.PORT}`, "Main");
}

bootstrap();
