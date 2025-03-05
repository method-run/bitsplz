"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingMessage = void 0;
const zod_1 = require("zod");
exports.PingMessage = zod_1.z.object({
    type: zod_1.z.literal("ping"),
});
