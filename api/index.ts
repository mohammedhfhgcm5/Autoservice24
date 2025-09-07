import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

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
