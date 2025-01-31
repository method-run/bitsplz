const STORAGE_KEY = "playerBitId";

type StoredBit = {
  /** UUID V4 */
  id: string;
  /** Integer */
  x: number;
  /** Integer */
  y: number;
  /** Date ISO string */
  created_at: string;
};

export type Bit = Omit<StoredBit, "created_at"> & {
  /** Date */
  created_at: Date;
};

export const savePlayerBitId = (bitId: string): void => {
  if (!bitId) {
    throw new Error("Bit ID is required");
  }

  localStorage.setItem(STORAGE_KEY, bitId);
};

export const loadPlayerBitId = (): string | null => {
  return localStorage.getItem(STORAGE_KEY);
};

export const createOrLoadPlayerBitAsync = async (): Promise<Bit> => {
  const bitId = loadPlayerBitId();
  return bitId ? loadPlayerBitAsync(bitId) : createPlayerBitAsync();
};

export const loadPlayerBitAsync = async (bitId: string): Promise<Bit> => {
  if (!bitId) {
    throw new Error("Bit ID is required");
  }

  const response = await fetch(`http://localhost:3000/api/bit/${bitId}`);

  if (!response.ok) {
    throw new Error("Failed to load bit");
  }

  const bitJson: StoredBit = await response.json();

  const loadedBit: Bit = {
    ...bitJson,
    created_at: new Date(bitJson.created_at),
  };

  return loadedBit;
};

/**
 * Creates a new bit and saves the bit ID to localStorage
 */
export const createPlayerBitAsync = async (): Promise<Bit> => {
  const response = await fetch("http://localhost:3000/api/bit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create bit");
  }

  const bitJson: StoredBit = await response.json();
  savePlayerBitId(bitJson.id);

  const createdBit: Bit = {
    ...bitJson,
    created_at: new Date(bitJson.created_at),
  };

  return createdBit;
};
