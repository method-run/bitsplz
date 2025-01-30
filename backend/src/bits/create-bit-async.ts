import { Pool } from "pg";
import { pool } from "../pool";

interface BitInput {
  x?: number;
  y?: number;
}

interface Bit {
  id: number;
  x: number;
  y: number;
  created_at: Date;
}

/**
 * Creates a new bit with random x,y coordinates between -16 and 16
 * @returns {Promise<Bit>} The created bit's id, x, y, created_at values
 */
export async function createBitAsync({
  /**
   * If you don't pass an x value, it will be a random number from -16 to 16
   */
  x: customX,
  /**
   * If you don't pass an y value, it will be a random number from -16 to 16
   */
  y: customY,
}: BitInput = {}): Promise<Bit> {
  // Generate random coordinates between -16 and 16
  const x =
    typeof customX === "number" ? customX : Math.floor(Math.random() * 33) - 16;

  const y =
    typeof customY === "number" ? customY : Math.floor(Math.random() * 33) - 16;

  const query = `
    INSERT INTO bits (x, y, created_at)
    VALUES ($1, $2, NOW())
    RETURNING id, x, y, created_at
  `;

  const result = await pool.query(query, [x, y]);
  return result.rows[0];
}
