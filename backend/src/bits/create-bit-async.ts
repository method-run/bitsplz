import { Pool } from "pg";
import { pool } from "../pool";
import { v4 as uuidv4 } from "uuid";
import { type Bit } from "./bit";

type BitInput = Pick<Bit, "x" | "y">;

/**
 * Creates a new bit with random x,y coordinates between -16 and 16
 * @returns {Promise<Bit>} The created bit's id, x, y, created_at values
 */
export async function createBitAsync(
  {
    /**
     * If you don't pass an x value, it will be a random number from -16 to 16
     */
    x,
    /**
     * If you don't pass an y value, it will be a random number from -16 to 16
     */
    y,
  }: BitInput = {
    x: Math.floor(Math.random() * 33) - 16,
    y: Math.floor(Math.random() * 33) - 16,
  }
): Promise<Bit> {
  const query = `
    INSERT INTO bits (x, y, created_at, last_updated)
    VALUES ($1, $2, NOW(), NOW())
    RETURNING id, x, y, created_at, last_updated
  `;

  const result = await pool.query(query, [x, y]);
  const bit = result.rows[0];

  return {
    ...bit,
    created_at: bit.created_at.toISOString(),
    updated_at: bit.last_updated.toISOString(),
  };
}
