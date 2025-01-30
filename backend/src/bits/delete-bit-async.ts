import { pool } from "../pool";

interface DeleteBitInput {
  id: string;
}

interface DeletedBit {
  id: string;
}

/**
 * Deletes a bit by its ID
 * @returns {Promise<DeletedBit>} The deleted bit's ID value
 */
export async function deleteBitAsync({
  /** A UUID for the bit to delete */
  id,
}: DeleteBitInput): Promise<DeletedBit> {
  const query = `DELETE FROM bits WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);

  if (!result.rows[0]) {
    throw new Error(`Bit with id ${id} not found`);
  }

  return result.rows[0];
}
