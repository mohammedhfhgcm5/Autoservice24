import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(dto: UserDto): Promise<import("mongoose").Document<unknown, {}, import("./user.schema").User, {}, {}> & import("./user.schema").User & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<UserDto[]>;
    findOne(id: string): Promise<import("./user.schema").User>;
    update(id: string, dto: Partial<UserDto>): Promise<import("./user.schema").User>;
    remove(id: string): Promise<void>;
}
