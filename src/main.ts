import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
//2BrnIvhBYEPPYWWk

//mongodb+srv://hfhgcm5_db_user:<db_password>@autoservice24.bjn5m4q.mongodb.net/?retryWrites=true&w=majority&appName=autoservice24