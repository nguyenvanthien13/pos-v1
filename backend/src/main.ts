import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap(){const app=await NestFactory.create(AppModule);app.setGlobalPrefix('api');app.enableCors({origin:(process.env.FRONTEND_ORIGIN||'http://localhost:5173').split(',').map(s=>s.trim())});await app.listen(Number(process.env.PORT)||3000,'0.0.0.0');}bootstrap();
