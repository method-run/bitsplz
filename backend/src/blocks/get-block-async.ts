import { getBitsInRangeByIdAsync } from "../bits/get-bits-in-range-by-id-async";
import { Block, BLOCK_SIZE } from "./block";
import { getEmptyBlock } from "./get-empty-block";

export async function getBlockAsync(
  /**The x coordinate of the position */
  x: number,
  /**The y coordinate of the position */
  y: number
): Promise<Block> {
  const block = getEmptyBlock(x, y);
  const bitsInRangeById = await getBitsInRangeByIdAsync(block.bounds);
  block.bitInRangeById = bitsInRangeById;
  return block;
}
