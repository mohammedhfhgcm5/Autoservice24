import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/chatdto';
import { UpdateChatDto } from './dto/update-chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    create(dto: CreateChatDto): Promise<import("mongoose").Document<unknown, {}, import("./chat.schema").ChatDocument, {}, {}> & import("./chat.schema").Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(user: any): Promise<(import("mongoose").Document<unknown, {}, import("./chat.schema").ChatDocument, {}, {}> & import("./chat.schema").Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./chat.schema").ChatDocument, {}, {}> & import("./chat.schema").Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateChatDto): Promise<import("mongoose").Document<unknown, {}, import("./chat.schema").ChatDocument, {}, {}> & import("./chat.schema").Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("./chat.schema").ChatDocument, {}, {}> & import("./chat.schema").Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
