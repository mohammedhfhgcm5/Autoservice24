import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

export enum ServiceType {
  VEHICLE_INSPECTION = 'Vehicle inspection & emissions test',
  CHANGE_OIL = 'Change oil',
  CHANGE_TIRES = 'Change tires',
  REMOVE_INSTALL_TIRES = 'Remove & install tires',
  CLEANING = 'Cleaning',
  DIAGNOSTIC_TEST = 'Test with diagnostic',
  PRE_TUV_CHECK = 'Pre-TÜV check',
  BALANCE_TIRES = 'Balance tires',
  WHEEL_ALIGNMENT = 'Adjust wheel alignment',
  POLISH = 'Polish',
  CHANGE_BRAKE_FLUID = 'Change brake fluid',
}

@Schema({ timestamps: true })
export class Service {
  @Prop({ type: Types.ObjectId, ref: 'workShop', required: true })
  workshop_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({
    type: String,
    enum: Object.values(ServiceType),
    required: true,
  })
  service_type: ServiceType;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
