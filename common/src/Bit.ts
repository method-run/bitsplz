import { z } from "zod";

export type Bit = {
  /** UUID V4 */
  id: string;
  /** Integer */
  x: number;
  /** Integer */
  y: number;
  /** Date ISO string */
  created_at: string;
  /** Date ISO string */
  updated_at: string;
};

export const Bit = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
