import { z } from "zod";
import { Block } from "./Block";

export const BlocksMessage = z.object({
  type: z.literal("blocks"),
  payload: z.record(z.string(), Block),
});

export type BlocksMessage = z.infer<typeof BlocksMessage>;
