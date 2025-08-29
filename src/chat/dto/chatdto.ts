// src/chat/DTO/chatDTO.ts
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsInt()
  user1Id: string;

  @IsInt()
  user2Id: string;
}
