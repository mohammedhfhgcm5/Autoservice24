import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { WorkshopModule } from './workshop/workshop.module';

@Module({
  imports: [UserModule, WorkshopModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
