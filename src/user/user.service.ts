// src/user/user.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userDto: UserDto) {
    const createdUser = new this.userModel(userDto);

    return await createdUser.save();
  }

  async findAll(): Promise<UserDto[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, userDto: Partial<UserDto>): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, userDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
  }

  async getOneUserByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (user) return user;
    else throw new UnauthorizedException('Invalid email or password');
  }

  async findByProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.userModel.findOne({ provider, providerId }).exec();
  }
}
