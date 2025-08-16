import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { WorkshopModule } from './workshop/workshop.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ServiceModule } from './service/service.module';
import { SavedServiceModule } from './saved-service/saved-service.module';
import { ChatModule } from './chat/chat.module';
import { MessagesModule } from './message/message.module';


@Module({
  imports: [
    UserModule,
    WorkshopModule,
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost/auto-service-24'),
    ServiceModule,
    SavedServiceModule,
    ChatModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
