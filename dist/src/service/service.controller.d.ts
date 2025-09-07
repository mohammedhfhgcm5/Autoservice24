import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceType } from './service.schema';
export declare class ServiceController {
    private readonly serviceService;
    constructor(serviceService: ServiceService);
    create(dto: CreateServiceDto, files: Array<Express.Multer.File>): Promise<import("./service.schema").Service>;
    findAll(serviceType?: ServiceType): Promise<import("./service.schema").Service[]>;
    search(query: string, serviceType?: ServiceType): Promise<import("./service.schema").Service[]>;
    getServiceTypes(): string[];
    findOne(id: string): Promise<import("./service.schema").Service>;
    update(id: string, dto: UpdateServiceDto): Promise<import("./service.schema").Service>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    uploadImages(id: string, files: Array<Express.Multer.File>): Promise<import("./service.schema").Service>;
}
