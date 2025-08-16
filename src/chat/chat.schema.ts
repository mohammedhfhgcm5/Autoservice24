import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true })
  user1Id: number;

  @Prop({ required: true })
  user2Id: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
