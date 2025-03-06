import { Block } from "../blocks/block";
import { pool } from "../pool";
import { Bit } from "./bit";

export async function getBitsInRangeByIdAsync(
  bounds: Block["bounds"]
): Promise<Record<string, Bit>> {
  const query = `
    SELECT id, x, y, created_at, last_updated
    FROM bits
    WHERE x >= $1 AND x < $2 AND y >= $3 AND y < $4
  `;

  const result = await pool.query(query, [
    bounds.left,
    bounds.right,
    bounds.top,
    bounds.bottom,
  ]);

  const bitsInRangeById: Record<string, Bit> = result.rows.reduce(
    (acc, bit) => ({
      ...acc,
      [bit.id]: bit,
    }),
    {}
  );

  return bitsInRangeById;
}
