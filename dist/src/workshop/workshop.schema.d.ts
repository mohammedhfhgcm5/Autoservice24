import { Document, Types } from 'mongoose';
export declare class workShop extends Document {
    user_id: Types.ObjectId;
    name: string;
    description: string;
    location_x: string;
    location_y: string;
    working_hours: string;
    profile_image?: String;
}
export declare const workShopSchema: import("mongoose").Schema<workShop, import("mongoose").Model<workShop, any, any, any, Document<unknown, any, workShop, any, {}> & workShop & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, workShop, Document<unknown, {}, import("mongoose").FlatRecord<workShop>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<workShop> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
