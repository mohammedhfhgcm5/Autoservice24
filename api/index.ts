import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; // <-- هنا استورد من srcimport { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();

const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors();
  return app.init();
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!server.locals.nestApp) {
    server.locals.nestApp = await createNestServer(server);
  }
  server(req, res);
}
