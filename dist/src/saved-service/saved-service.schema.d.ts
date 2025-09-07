import { Document, Types } from 'mongoose';
export type SavedServiceDocument = SavedService & Document;
export declare class SavedService {
    user_id: Types.ObjectId;
    service_id: Types.ObjectId;
    saved_at: Date;
}
export declare const SavedServiceSchema: import("mongoose").Schema<SavedService, import("mongoose").Model<SavedService, any, any, any, Document<unknown, any, SavedService, any, {}> & SavedService & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SavedService, Document<unknown, {}, import("mongoose").FlatRecord<SavedService>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<SavedService> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
