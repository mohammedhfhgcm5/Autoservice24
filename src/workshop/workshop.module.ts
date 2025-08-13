import { Module } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';
import { workShop, workShopSchema } from './workshop.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: workShop.name, schema: workShopSchema },
    ]),
  ],
  controllers: [WorkshopController],
  providers: [WorkshopService],
})
export class WorkshopModule {}
