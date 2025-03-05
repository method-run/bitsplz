import { z } from "zod";
export const PingMessage = z.object({
  type: z.literal("ping"),
});

export type PingMessage = z.infer<typeof PingMessage>;
