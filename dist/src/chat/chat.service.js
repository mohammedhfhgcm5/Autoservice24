"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_schema_1 = require("./chat.schema");
let ChatService = class ChatService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async create(dto) {
        const { user1Id, user2Id } = dto;
        let existingChat = await this.chatModel.findOne({
            $or: [
                { user1Id, user2Id },
                { user1Id: user2Id, user2Id: user1Id },
            ],
        });
        if (existingChat) {
            return existingChat;
        }
        const created = new this.chatModel(dto);
        return created.save();
    }
    async findAll(userId) {
        return this.chatModel
            .find({
            $or: [{ user1Id: userId }, { user2Id: userId }],
        })
            .exec();
    }
    async findOne(id) {
        const chat = await this.chatModel.findById(id).exec();
        if (!chat)
            throw new common_1.NotFoundException(`Chat with ID ${id} not found`);
        return chat;
    }
    async update(id, dto) {
        const updated = await this.chatModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException(`Chat with ID ${id} not found`);
        return updated;
    }
    async remove(id) {
        const deleted = await this.chatModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException(`Chat with ID ${id} not found`);
        return deleted;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_schema_1.Chat.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map