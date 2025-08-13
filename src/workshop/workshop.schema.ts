import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class workShop extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 'user' })
  location_x: string;

  @Prop({ required: true })
  location_y: string;

  @Prop({ required: true })
  working_hours: string;

  @Prop({ required: true })
  profile_image: String;

  @Prop({ required: true })
  created_at: Date;
}

export const workShopSchema = SchemaFactory.createForClass(workShop);
