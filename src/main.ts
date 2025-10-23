import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

 app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 8000);

  console.log(`Server is running on http://localhost:${process.env.PORT ?? 8000} fix upload`);
}
bootstrap();
//2BrnIvhBYEPPYWWk

