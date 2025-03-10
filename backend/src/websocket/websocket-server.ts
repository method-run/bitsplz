import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { pingHandler } from "./messageHandlers/ping";
import { moveHandler } from "./messageHandlers/move";

// Define all message handlers
const messageHandlers = [pingHandler, moveHandler];

// Track connected clients
const clients = new Set<WebSocket>();

export function initializeWebSocket(server: Server) {
  const wsPath = process.env.WS_PATH || "/ws";
  const wss = new WebSocketServer({
    server,
    path: wsPath,
  });

  const host = process.env.HOST || "0.0.0.0";
  const port = parseInt(process.env.PORT || "3000", 10);
  console.log(`WebSocket server listening on ws://${host}:${port}${wsPath}`);

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`Added connection. Clients connected: ${clients.size}`);

    ws.on("message", (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());

        // Try each message handler until one succeeds
        for (const handler of messageHandlers) {
          if (handler.schema.safeParse(data).success) {
            handler.handle(data, ws, clients);
            return;
          }
        }

        console.warn("Received unhandled message type:", data);
      } catch (error) {
        console.error("Failed to process message:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`Closed connection. Clients connected: ${clients.size}`);
    });
  });

  return wss;
}
