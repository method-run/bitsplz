import { pool } from "../pool";
import { type Bit } from "./bit";

type GetBitInput = Pick<Bit, "id">;

/**
 * Gets a bit by its ID
 * @returns {Promise<Bit>} The bit's id, x, y, created_at values
 */
export async function getBitAsync({
  /** A UUID for the bit to retrieve */
  id,
}: GetBitInput): Promise<Bit> {
  const query = `
    SELECT id, x, y, created_at, last_updated
    FROM bits
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (!result.rows[0]) {
    throw new Error(`Bit with id ${id} not found`);
  }

  const bit = result.rows[0];

  return {
    ...bit,
    created_at: bit.created_at.toISOString(),
    updated_at: bit.last_updated.toISOString(),
  };
}
