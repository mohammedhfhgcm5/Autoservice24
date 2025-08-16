import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  senderId: number;

  @IsInt()
  receiverId: number;

  @IsString()
  chatId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  image?: string;
}
