import { Bit } from "../bits/bit";

export const BLOCK_SIZE = 32;

export type Block = {
  blockId: string;
  bitInRangeById: Record<string, Bit>;
  /**
   * The top, right, bottom, left are grid coordinates of the dimensions we expect to be visible,
   * in terms unit squares from the origin.
   */
  bounds: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};
