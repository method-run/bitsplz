import { Block, BLOCK_SIZE } from "./block";
import { makeBlockId } from "./make-block-id";

export function getEmptyBlock(
  /**The x coordinate of the position */
  x: number,
  /**The y coordinate of the position */
  y: number
): Block {
  // Floor division to get the block index
  const blockX = Math.floor(x / BLOCK_SIZE);
  const blockY = Math.floor(y / BLOCK_SIZE);
  const blockId = makeBlockId(blockX, blockY);

  return {
    blockId,
    bitInRangeById: {},
    bounds: {
      left: blockX * BLOCK_SIZE,
      right: (blockX + 1) * BLOCK_SIZE,
      top: blockY * BLOCK_SIZE,
      bottom: (blockY + 1) * BLOCK_SIZE,
    },
  };
}
