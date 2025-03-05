import { z } from "zod";
export declare const MoveMessage: z.ZodObject<{
    type: z.ZodLiteral<"move">;
    payload: z.ZodObject<{
        bitId: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        time: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        bitId: string;
        x: number;
        y: number;
        time: number;
    }, {
        bitId: string;
        x: number;
        y: number;
        time: number;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "move";
    payload: {
        bitId: string;
        x: number;
        y: number;
        time: number;
    };
}, {
    type: "move";
    payload: {
        bitId: string;
        x: number;
        y: number;
        time: number;
    };
}>;
export type MoveMessage = z.infer<typeof MoveMessage>;
