import { WorkshopService } from './workshop.service';
import { workShopDto } from './dto/workshop.dto';
export declare class WorkshopController {
    private readonly service;
    constructor(service: WorkshopService);
    create(dto: workShopDto, user: any): Promise<import("mongoose").Document<unknown, {}, import("./workshop.schema").workShop, {}, {}> & import("./workshop.schema").workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("./workshop.schema").workShop, {}, {}> & import("./workshop.schema").workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./workshop.schema").workShop, {}, {}> & import("./workshop.schema").workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    update(id: string, dto: workShopDto): Promise<import("mongoose").Document<unknown, {}, import("./workshop.schema").workShop, {}, {}> & import("./workshop.schema").workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
