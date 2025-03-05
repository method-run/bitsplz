import { WebSocket } from "ws";
import { MessageHandler } from "./messageHandler";
import { PingMessage } from "../../../common/dist/PingMessage";

export const pingHandler: MessageHandler<PingMessage> = {
  schema: PingMessage,
  handle: (message: PingMessage, ws: WebSocket, clients: Set<WebSocket>) => {
    console.log("Received ping, sending pong");
    ws.send(JSON.stringify({ type: "pong" }));
  },
};
