import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedService, SavedServiceDocument } from './saved-service.schema';
import { CreateSavedServiceDto } from './dto/create-saved-service.dto';
import { UpdateSavedServiceDto } from './dto/update-saved-service.dto';

@Injectable()
export class SavedServiceService {
  constructor(
    @InjectModel(SavedService.name)
    private readonly savedServiceModel: Model<SavedServiceDocument>,
  ) {}

  async create(dto: CreateSavedServiceDto): Promise<SavedService> {
    const saved = new this.savedServiceModel(dto);
    return saved.save();
  }

  async findAll(): Promise<SavedService[]> {
    return this.savedServiceModel
      .find()
      .populate('user_id')
      .populate('service_id')
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<SavedService> {
    const saved = await this.savedServiceModel
      .findById(id)
      .populate('user_id')
      .populate('service_id')
      .lean();
    if (!saved) throw new NotFoundException('Saved service not found');
    return saved;
  }

  async update(id: string, dto: UpdateSavedServiceDto): Promise<SavedService> {
    const updated = await this.savedServiceModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new NotFoundException('Saved service not found');
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.savedServiceModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Saved service not found');
    return { success: true };
  }
}
