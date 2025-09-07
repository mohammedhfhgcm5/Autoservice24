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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./message.schema");
let MessagesService = class MessagesService {
    messageModel;
    constructor(messageModel) {
        this.messageModel = messageModel;
    }
    async create(dto) {
        const created = new this.messageModel(dto);
        return created.save();
    }
    async findAll() {
        return this.messageModel.find().exec();
    }
    async findOne(id) {
        const message = await this.messageModel.findById(id).exec();
        if (!message)
            throw new common_1.NotFoundException(`Message with ID ${id} not found`);
        return message;
    }
    async update(id, dto) {
        const updated = await this.messageModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException(`Message with ID ${id} not found`);
        return updated;
    }
    async remove(id) {
        const deleted = await this.messageModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException(`Message with ID ${id} not found`);
        return deleted;
    }
    async findByChatId(chatId) {
        return this.messageModel.find({ chatId }).exec();
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MessagesService);
//# sourceMappingURL=message.service.js.map