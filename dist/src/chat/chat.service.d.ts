import { Model } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';
import { CreateChatDto } from './dto/chatdto';
import { UpdateChatDto } from './dto/update-chat.dto';
export declare class ChatService {
    private chatModel;
    constructor(chatModel: Model<ChatDocument>);
    create(dto: CreateChatDto): Promise<import("mongoose").Document<unknown, {}, ChatDocument, {}, {}> & Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(userId: string): Promise<(import("mongoose").Document<unknown, {}, ChatDocument, {}, {}> & Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, ChatDocument, {}, {}> & Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateChatDto): Promise<import("mongoose").Document<unknown, {}, ChatDocument, {}, {}> & Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, ChatDocument, {}, {}> & Chat & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
