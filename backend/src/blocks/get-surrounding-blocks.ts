import { Block, BLOCK_SIZE } from "./block";
import { getBlockAsync } from "./get-block-async";

const BUFFER_SIZE = 1;

export async function getSurroundingBlocksByIdAsync(
  block: Block
): Promise<Record<string, Block>> {
  const { top, left } = block.bounds;
  const blocksById: Record<string, Block> = {};

  for (let x = left - BLOCK_SIZE; x <= left + BLOCK_SIZE; x += BLOCK_SIZE) {
    for (let y = top - BLOCK_SIZE; y <= top + BLOCK_SIZE; y += BLOCK_SIZE) {
      const surroundingBlock: Block = await getBlockAsync(x, y);
      blocksById[surroundingBlock.blockId] = surroundingBlock;
    }
  }

  return blocksById;
}
