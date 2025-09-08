"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateChatDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const chatdto_1 = require("./chatdto");
class UpdateChatDto extends (0, mapped_types_1.PartialType)(chatdto_1.CreateChatDto) {
}
exports.UpdateChatDto = UpdateChatDto;
//# sourceMappingURL=update-chat.dto.js.map