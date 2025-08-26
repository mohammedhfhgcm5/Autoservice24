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
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    // 👇 Enables static serving for uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // URL prefix
    }),

    // MongoDB connection
    MongooseModule.forRoot('mongodb://localhost/auto-service-24'),

    // App modules
    UserModule,
    WorkshopModule,
    AuthModule,
    ServiceModule,
    SavedServiceModule,
    ChatModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
