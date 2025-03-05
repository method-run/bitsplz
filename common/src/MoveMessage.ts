import { z } from "zod";

export const MoveMessage = z.object({
  type: z.literal("move"),
  payload: z.object({
    bitId: z.string(),
    x: z.number(),
    y: z.number(),
    time: z.number(),
  }),
});

export type MoveMessage = z.infer<typeof MoveMessage>;
