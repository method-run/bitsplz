const STORAGE_KEY = "playerBitId";

export const savePlayerBitId = (bitId) => {
  if (!bitId) {
    throw new Error("Bit ID is required");
  }

  localStorage.setItem(STORAGE_KEY, bitId);
};

export const loadPlayerBitId = () => {
  return localStorage.getItem(STORAGE_KEY);
};

export const createOrLoadPlayerBitAsync = async () => {
  const bitId = loadPlayerBitId();
  return bitId ? loadPlayerBitAsync(bitId) : createPlayerBitAsync();
};

export const loadPlayerBitAsync = async (bitId) => {
  if (!bitId) {
    throw new Error("Bit ID is required");
  }

  const response = await fetch(`http://localhost:3000/api/bit/${bitId}`);

  if (!response.ok) {
    throw new Error("Failed to load bit");
  }

  const bitJson = await response.json();
  const bit = { ...bitJson, created_at: new Date(bitJson.created_at) };
  return bit;
};

/**
 * Creates a new bit and saves the bit ID to localStorage
 * @returns {Promise<Object>} The created bit
 */
export const createPlayerBitAsync = async () => {
  const response = await fetch("http://localhost:3000/api/bit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create bit");
  }

  const bitJson = await response.json();
  savePlayerBitId(bitJson.id);
  return bitJson;
};
