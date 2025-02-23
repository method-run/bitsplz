import { z } from "zod";
import { WebSocket } from "ws";
import { MessageHandler } from "./messageHandler";

export const PingMessage = z.object({
  type: z.literal("ping"),
});

export type PingMessage = z.infer<typeof PingMessage>;

export const pingHandler: MessageHandler<PingMessage> = {
  schema: PingMessage,
  handle: (message: PingMessage, ws: WebSocket, clients: Set<WebSocket>) => {
    console.log("Received ping, sending pong");
    ws.send(JSON.stringify({ type: "pong" }));
  },
};
