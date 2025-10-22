import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument, ServiceType } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { workShop } from 'src/workshop/workshop.schema';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(workShop.name) private workshopModel: Model<workShop>,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    const newService = new this.serviceModel(dto);
    return newService.save();
  }

 async findAll(
    serviceType?: ServiceType,
    skip = 0,
    limit = 10,
  ): Promise<{ data: Service[]; total: number }> {
    const filter = serviceType ? { service_type: serviceType } : {};

    const [data, total] = await Promise.all([
      this.serviceModel
        .find(filter)
        .populate('workshop_id')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.serviceModel.countDocuments(filter),
    ]);

    return { data, total };
  }

  async search(query: string, serviceType?: ServiceType): Promise<Service[]> {
    const filter: any = {};
    if (serviceType) filter.service_type = serviceType;
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }
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

  async addImages(id: string, images: string[]): Promise<Service> {
    const updated = await this.serviceModel.findByIdAndUpdate(
      id,
      { $push: { images: { $each: images } } },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  getServiceTypes(): string[] {
    return Object.values(ServiceType);
  }


   async getWorkshopOwnerPhoneByServiceId(serviceId: string): Promise<{ phone: string | null }> {
    if (!Types.ObjectId.isValid(serviceId)) {
      throw new NotFoundException('Invalid service id');
    }

    // نجيب الـ service ونعمل populate للـ workshop ثم للـ user
    const service = await this.serviceModel
      .findById(serviceId)
      .populate({
        path: 'workshop_id',
        populate: { path: 'user_id', model: 'User' },
      })
      .lean()
      .exec();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const workshop = service.workshop_id as any;
    if (!workshop) {
      throw new NotFoundException('Workshop not found for this service');
    }

    const owner = workshop.user_id as any;
    if (!owner) {
      throw new NotFoundException('Owner not found for this workshop');
    }

    // قد يكون الحقل فارغًا؛ نعيد null أو رقم
    const phone = owner.phone ?? null;

    return { phone };
  }

  
}
