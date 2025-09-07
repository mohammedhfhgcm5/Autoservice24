import { SavedServiceService } from './saved-service.service';
import { CreateSavedServiceDto } from './dto/create-saved-service.dto';
import { UpdateSavedServiceDto } from './dto/update-saved-service.dto';
export declare class SavedServiceController {
    private readonly savedServiceService;
    constructor(savedServiceService: SavedServiceService);
    create(dto: CreateSavedServiceDto): Promise<import("./saved-service.schema").SavedService>;
    findAll(): Promise<import("./saved-service.schema").SavedService[]>;
    findOne(id: string): Promise<import("./saved-service.schema").SavedService>;
    update(id: string, dto: UpdateSavedServiceDto): Promise<import("./saved-service.schema").SavedService>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
