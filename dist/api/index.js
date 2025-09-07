"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const express_1 = __importDefault(require("express"));
const platform_express_1 = require("@nestjs/platform-express");
const server = (0, express_1.default)();
const createNestServer = async (expressInstance) => {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressInstance));
    app.enableCors();
    return app.init();
};
async function handler(req, res) {
    if (!server.locals.nestApp) {
        server.locals.nestApp = await createNestServer(server);
    }
    server(req, res);
}
//# sourceMappingURL=index.js.map