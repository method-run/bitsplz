import { pool } from "../pool";

interface GetBitInput {
  id: string;
}

interface Bit {
  id: string;
  x: number;
  y: number;
  created_at: Date;
}

/**
 * Gets a bit by its ID
 * @returns {Promise<Bit>} The bit's id, x, y, created_at values
 */
export async function getBitAsync({
  /** A UUID for the bit to retrieve */
  id,
}: GetBitInput): Promise<Bit> {
  const query = `
    SELECT id, x, y, created_at
    FROM bits
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (!result.rows[0]) {
    throw new Error(`Bit with id ${id} not found`);
  }

  return result.rows[0];
}
