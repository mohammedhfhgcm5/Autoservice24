import { Document, Types } from 'mongoose';
export type ServiceDocument = Service & Document;
export declare enum ServiceType {
    VEHICLE_INSPECTION = "Vehicle inspection & emissions test",
    CHANGE_OIL = "Change oil",
    CHANGE_TIRES = "Change tires",
    REMOVE_INSTALL_TIRES = "Remove & install tires",
    CLEANING = "Cleaning",
    DIAGNOSTIC_TEST = "Test with diagnostic",
    PRE_TUV_CHECK = "Pre-T\u00DCV check",
    BALANCE_TIRES = "Balance tires",
    WHEEL_ALIGNMENT = "Adjust wheel alignment",
    POLISH = "Polish",
    CHANGE_BRAKE_FLUID = "Change brake fluid"
}
export declare class Service {
    workshop_id: Types.ObjectId;
    title: string;
    description: string;
    price: number;
    images?: string[];
    service_type: ServiceType;
}
export declare const ServiceSchema: import("mongoose").Schema<Service, import("mongoose").Model<Service, any, any, any, Document<unknown, any, Service, any, {}> & Service & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Service, Document<unknown, {}, import("mongoose").FlatRecord<Service>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Service> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
