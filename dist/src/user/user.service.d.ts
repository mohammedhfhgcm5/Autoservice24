import { User } from './user.schema';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<User>);
    create(userDto: UserDto): Promise<import("mongoose").Document<unknown, {}, User, {}, {}> & User & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<UserDto[]>;
    findOne(id: string): Promise<User>;
    update(id: string, userDto: Partial<UserDto>): Promise<User>;
    delete(id: string): Promise<void>;
    getOneUserByEmail(email: string): Promise<import("mongoose").Document<unknown, {}, User, {}, {}> & User & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findByProvider(provider: string, providerId: string): Promise<User | null>;
}
