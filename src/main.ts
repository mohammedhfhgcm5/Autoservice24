import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
//2BrnIvhBYEPPYWWk

//mongodb+srv://hfhgcm5_db_user:<db_password>@autoservice24.bjn5m4q.mongodb.net/?retryWrites=true&w=majority&appName=autoservice24