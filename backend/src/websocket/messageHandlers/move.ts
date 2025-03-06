import { WebSocket } from "ws";
import { MessageHandler } from "./messageHandler";
import { MoveMessage } from "../../../common/dist/MoveMessage";
import { getEmptyBlock } from "../../blocks/get-empty-block";
import { getSurroundingBlocksByIdAsync } from "../../blocks/get-surrounding-blocks";
import { BlocksMessage } from "../../../common/src/BlocksMessage";
import { updateBitAsync } from "../../bits/update-bit-async";

export const moveHandler: MessageHandler<MoveMessage> = {
  schema: MoveMessage,
  handle: async (
    message: MoveMessage,
    ws: WebSocket,
    clients: Set<WebSocket>
  ) => {
    // Broadcast the movement to all other clients
    for (const client of clients) {
      if (
        // client !== ws &&
        client.readyState === WebSocket.OPEN
      ) {
        const movedBit = message.payload;

        await updateBitAsync({
          id: movedBit.bitId,
          x: movedBit.x,
          y: movedBit.y,
        });

        const bitBlock = getEmptyBlock(message.payload.x, message.payload.y);
        const surroundingBlocks = await getSurroundingBlocksByIdAsync(bitBlock);

        const responseMessage: BlocksMessage = {
          type: "blocks",
          payload: surroundingBlocks,
        };

        client.send(JSON.stringify(responseMessage));
      }
    }
  },
};
