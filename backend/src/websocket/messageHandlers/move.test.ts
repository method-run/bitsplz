import { WebSocket } from "ws";
import { moveHandler, MoveMessage } from "./move";

describe("moveHandler", () => {
  const validMessage: MoveMessage = {
    type: "move",
    payload: {
      bitId: "test-bit",
      x: 100,
      y: 200,
      time: 1234567890,
    },
  };

  it("should validate move message schema", () => {
    const invalidMessages = [
      { type: "move" }, // missing payload
      { type: "move", payload: {} }, // empty payload
      {
        type: "move",
        payload: {
          bitId: 123, // wrong type
          x: 100,
          y: 200,
          time: 1234567890,
        },
      },
      {
        type: "move",
        payload: {
          bitId: "test-bit",
          x: "100", // wrong type
          y: 200,
          time: 1234567890,
        },
      },
    ];

    expect(moveHandler.schema.safeParse(validMessage).success).toBe(true);

    invalidMessages.forEach((msg) => {
      expect(moveHandler.schema.safeParse(msg).success).toBe(false);
    });
  });

  it("should broadcast move to other clients only", () => {
    const senderWs = {
      send: jest.fn(),
      readyState: WebSocket.OPEN,
    } as unknown as WebSocket;

    const receiver1 = {
      send: jest.fn(),
      readyState: WebSocket.OPEN,
    } as unknown as WebSocket;

    const receiver2 = {
      send: jest.fn(),
      readyState: WebSocket.OPEN,
    } as unknown as WebSocket;

    const closedReceiver = {
      send: jest.fn(),
      readyState: WebSocket.CLOSED,
    } as unknown as WebSocket;

    const clients = new Set([senderWs, receiver1, receiver2, closedReceiver]);

    moveHandler.handle(validMessage, senderWs, clients);

    // Sender should not receive the message
    expect(senderWs.send).not.toHaveBeenCalled();

    // Open receivers should receive the message
    expect(receiver1.send).toHaveBeenCalledWith(JSON.stringify(validMessage));
    expect(receiver2.send).toHaveBeenCalledWith(JSON.stringify(validMessage));

    // Closed receiver should not receive the message
    expect(closedReceiver.send).not.toHaveBeenCalled();
  });
});
