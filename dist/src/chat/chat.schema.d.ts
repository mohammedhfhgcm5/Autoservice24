import { Document } from 'mongoose';
export type ChatDocument = Chat & Document;
export declare class Chat {
    user1Id: string;
    user2Id: string;
}
export declare const ChatSchema: import("mongoose").Schema<Chat, import("mongoose").Model<Chat, any, any, any, Document<unknown, any, Chat, any, {}> & Chat & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Chat, Document<unknown, {}, import("mongoose").FlatRecord<Chat>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Chat> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
