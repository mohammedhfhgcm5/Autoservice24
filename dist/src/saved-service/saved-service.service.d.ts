import { Model } from 'mongoose';
import { SavedService, SavedServiceDocument } from './saved-service.schema';
import { CreateSavedServiceDto } from './dto/create-saved-service.dto';
import { UpdateSavedServiceDto } from './dto/update-saved-service.dto';
export declare class SavedServiceService {
    private readonly savedServiceModel;
    constructor(savedServiceModel: Model<SavedServiceDocument>);
    create(dto: CreateSavedServiceDto): Promise<SavedService>;
    findAll(): Promise<SavedService[]>;
    findOne(id: string): Promise<SavedService>;
    update(id: string, dto: UpdateSavedServiceDto): Promise<SavedService>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
