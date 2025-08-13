// src/workshop/workshop.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { workShop } from './workshop.schema';
import { workShopDto } from './dto/workshop.dto';

@Injectable()
export class WorkshopService {
  constructor(@InjectModel(workShop.name) private model: Model<workShop>) {}

  create(dto: workShopDto) {
    const created = new this.model(dto);
    return created.save();
  }

  findAll() {
    return this.model.find().exec();
  }

  findOne(id: string) {
    return this.model.findById(id).exec();
  }

  async update(id: string, dto: workShopDto) {
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Workshop not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Workshop not found');
    return { message: 'Deleted successfully' };
  }
}
