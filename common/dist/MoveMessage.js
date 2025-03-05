"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveMessage = void 0;
const zod_1 = require("zod");
exports.MoveMessage = zod_1.z.object({
    type: zod_1.z.literal("move"),
    payload: zod_1.z.object({
        bitId: zod_1.z.string(),
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        time: zod_1.z.number(),
    }),
});
