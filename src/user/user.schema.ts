import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email?: string;

  @Prop() // <-- لم يعد required
  password?: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 'user', enum: ['user', 'owner'] })
  user_type: string;

  @Prop()
  phone?: string;

  @Prop()
  profile_image?: string;

  @Prop({ default: 'local', enum: ['local', 'google', 'facebook', 'apple'] })
  provider: string;

  @Prop() // مثال: sub من Google أو id من Facebook
  providerId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
