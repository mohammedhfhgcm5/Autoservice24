import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './chat.schema';
import { CreateChatDto } from './dto/chatdto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) {}

  async create(dto: CreateChatDto) {
    const created = new this.chatModel(dto);
    return created.save();
  }

  async findAll(userId: string) {
    return this.chatModel
      .find({
        $or: [{ user1Id: userId }, { user2Id: userId }],
      })
      .exec();
  }

  async findOne(id: string) {
    const chat = await this.chatModel.findById(id).exec();
    if (!chat) throw new NotFoundException(`Chat with ID ${id} not found`);
    return chat;
  }

  async update(id: string, dto: UpdateChatDto) {
    const updated = await this.chatModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Chat with ID ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.chatModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Chat with ID ${id} not found`);
    return deleted;
  }
}
