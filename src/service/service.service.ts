import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service, ServiceDocument, ServiceType } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    const newService = new this.serviceModel(dto);
    return newService.save();
  }

  // Optionally filter by service_type
  async findAll(serviceType?: ServiceType): Promise<Service[]> {
    const filter = serviceType ? { service_type: serviceType } : {};
    return this.serviceModel.find(filter).populate('workshop_id').lean().exec();
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel
      .findById(id)
      .populate('workshop_id')
      .lean();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const updated = await this.serviceModel.findByIdAndUpdate(id, dto, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const result = await this.serviceModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Service not found');
    return { success: true };
  }

  // Return all valid service types
  getServiceTypes(): string[] {
    return Object.values(ServiceType);
  }
}
