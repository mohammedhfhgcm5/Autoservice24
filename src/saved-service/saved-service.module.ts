import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedServiceService } from './saved-service.service';
import { SavedServiceController } from './saved-service.controller';
import { SavedService, SavedServiceSchema } from './saved-service.schema';
import { Service, ServiceSchema } from '../service/service.schema';
import { User, UserSchema } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SavedService.name, schema: SavedServiceSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SavedServiceController],
  providers: [SavedServiceService],
})
export class SavedServiceModule {}
