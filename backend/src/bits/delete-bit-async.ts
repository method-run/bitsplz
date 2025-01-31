import { pool } from "../pool";
import { type Bit } from "./bit";

type DeleteBitInput = Pick<Bit, "id">;

/**
 * Deletes a bit by its ID
 * @returns {Promise<DeletedBit>} The deleted bit's ID value
 */
export async function deleteBitAsync({
  /** A UUID for the bit to delete */
  id,
}: DeleteBitInput): Promise<Bit> {
  const query = `DELETE FROM bits WHERE id = $1 RETURNING id, x, y, created_at, last_updated`;
  const result = await pool.query(query, [id]);

  if (!result.rows[0]) {
    throw new Error(`Bit with id ${id} not found`);
  }

  const deletedBit = result.rows[0];

  return {
    ...deletedBit,
    created_at: deletedBit.created_at.toISOString(),
    updated_at: deletedBit.last_updated.toISOString(),
  };
}
