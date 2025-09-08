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
exports.WorkshopService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const workshop_schema_1 = require("./workshop.schema");
let WorkshopService = class WorkshopService {
    model;
    constructor(model) {
        this.model = model;
    }
    create(dto, userId) {
        const created = new this.model({
            ...dto,
            user_id: new mongoose_2.Types.ObjectId(userId),
        });
        return created.save();
    }
    findAll() {
        return this.model.find().exec();
    }
    findOne(id) {
        return this.model.findById(id).exec();
    }
    async update(id, dto) {
        const updated = await this.model
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Workshop not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.model.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Workshop not found');
        return { message: 'Deleted successfully' };
    }
};
exports.WorkshopService = WorkshopService;
exports.WorkshopService = WorkshopService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(workshop_schema_1.workShop.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WorkshopService);
//# sourceMappingURL=workshop.service.js.map