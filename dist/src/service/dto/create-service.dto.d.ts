import { ServiceType } from '../service.schema';
export declare class CreateServiceDto {
    workshop_id: string;
    title: string;
    description?: string;
    price: number;
    images?: string[];
    service_type: ServiceType;
}
