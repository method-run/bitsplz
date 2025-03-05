import { WebSocket } from "ws";
import { pingHandler } from "./ping";
import { PingMessage } from "../../../common/dist/PingMessage";

describe("pingHandler", () => {
  it("should send a pong response", () => {
    const mockWs = {
      send: jest.fn(),
    } as unknown as WebSocket;

    const mockClients = new Set<WebSocket>();

    pingHandler.handle({ type: "ping" }, mockWs, mockClients);

    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: "pong" }));
  });

  it("should validate ping message schema", () => {
    const validMessage = { type: "ping" };
    const invalidMessage = { type: "invalid" };

    expect(pingHandler.schema.safeParse(validMessage).success).toBe(true);
    expect(pingHandler.schema.safeParse(invalidMessage).success).toBe(false);
  });
});
