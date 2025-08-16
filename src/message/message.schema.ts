import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  senderId: number;

  @Prop({ required: true })
  receiverId: number;

  @Prop({ type: Types.ObjectId, ref: 'chat', required: true })
  chatId: Types.ObjectId;

  @Prop()
  content?: string;

  @Prop()
  image?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
