import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 'user', enum: ['user', 'owner'] })
  user_type: string;

  @Prop({ required: true })
  phone: string;

  @Prop({})
  profile_image?: string;


}

export const UserSchema = SchemaFactory.createForClass(User);
