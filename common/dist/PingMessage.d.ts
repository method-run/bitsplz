import { z } from "zod";
export declare const PingMessage: z.ZodObject<{
    type: z.ZodLiteral<"ping">;
}, "strip", z.ZodTypeAny, {
    type: "ping";
}, {
    type: "ping";
}>;
export type PingMessage = z.infer<typeof PingMessage>;
