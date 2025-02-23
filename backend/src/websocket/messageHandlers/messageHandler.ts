import { z } from "zod";
import { WebSocket } from "ws";

export type MessageHandler<T> = {
  schema: z.ZodType<T>;
  handle: (message: T, ws: WebSocket, clients: Set<WebSocket>) => void;
};
