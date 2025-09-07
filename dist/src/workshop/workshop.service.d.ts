import { Model } from 'mongoose';
import { workShop } from './workshop.schema';
import { workShopDto } from './dto/workshop.dto';
export declare class WorkshopService {
    private model;
    constructor(model: Model<workShop>);
    create(dto: workShopDto, userId: string): Promise<import("mongoose").Document<unknown, {}, workShop, {}, {}> & workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, workShop, {}, {}> & workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<(import("mongoose").Document<unknown, {}, workShop, {}, {}> & workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    update(id: string, dto: workShopDto): Promise<import("mongoose").Document<unknown, {}, workShop, {}, {}> & workShop & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
