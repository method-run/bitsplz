import { z } from "zod";
import { WebSocket } from "ws";
import { MessageHandler } from "./messageHandler";

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

export const moveHandler: MessageHandler<MoveMessage> = {
  schema: MoveMessage,
  handle: (message: MoveMessage, ws: WebSocket, clients: Set<WebSocket>) => {
    // Broadcast the movement to all other clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  },
};
