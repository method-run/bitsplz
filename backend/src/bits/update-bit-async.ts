import { Pool } from "pg";
import { pool } from "../pool";
import { v4 as uuidv4 } from "uuid";
import { type Bit } from "./bit";

type BitInput = Pick<Bit, "id" | "x" | "y">;

/**
 * Updates a bit with new x,y coordinates
 * @returns {Promise<Bit>} The updated bit's id, x, y, last_updated values
 */
export async function updateBitAsync({ id, x, y }: BitInput): Promise<Bit> {
  const query = `
    UPDATE bits
    SET id = $1, x = $2, y = $3, last_updated = NOW()
    WHERE id = $1
    RETURNING id, x, y, created_at, last_updated
  `;

  const result = await pool.query(query, [id, x, y]);
  const bit = result.rows[0];

  return {
    ...bit,
    created_at: bit.created_at.toISOString(),
    updated_at: bit.last_updated.toISOString(),
  };
}
