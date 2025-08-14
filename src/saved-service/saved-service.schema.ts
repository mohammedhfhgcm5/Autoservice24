import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedServiceDocument = SavedService & Document;

@Schema({ timestamps: false }) // no auto timestamps
export class SavedService {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: true })
  service_id: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  saved_at: Date;
}

export const SavedServiceSchema = SchemaFactory.createForClass(SavedService);
