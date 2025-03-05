import { WebSocket } from "ws";
import { MessageHandler } from "./messageHandler";
import { MoveMessage } from "../../../common/dist/MoveMessage";

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
