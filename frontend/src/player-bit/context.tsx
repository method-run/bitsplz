import { createContext } from "react";

// eslint-disable-next-line no-unused-vars
const EXAMPLE_BIT = {
  /** @type {string} */
  id: "fa6c7192-f99e-4518-b11e-737bde998815",
  /** @type {number} */
  x: 9,
  /** @type {number} */
  y: 11,
  /** @type {Date} */
  created_at: new Date("2025-01-07T02:18:11.893Z"),
};

export const PlayerBitContext = createContext({
  /** @type {typeof EXAMPLE_BIT | null} */
  bit: null,
  /** @type {function(): Promise<typeof EXAMPLE_BIT | null>} */
  createOrLoadBitAsync: null,
});
