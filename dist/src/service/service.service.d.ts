import { Model } from 'mongoose';
import { Service, ServiceDocument, ServiceType } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServiceService {
    private readonly serviceModel;
    constructor(serviceModel: Model<ServiceDocument>);
    create(dto: CreateServiceDto): Promise<Service>;
    findAll(serviceType?: ServiceType): Promise<Service[]>;
    search(query: string, serviceType?: ServiceType): Promise<Service[]>;
    findOne(id: string): Promise<Service>;
    update(id: string, dto: UpdateServiceDto): Promise<Service>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    addImages(id: string, images: string[]): Promise<Service>;
    getServiceTypes(): string[];
}
