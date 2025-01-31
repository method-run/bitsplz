import { createContext } from "react";
import { Bit } from "./storage";

type PlayerBitContextType = {
  bit: Bit | null;
  createOrLoadBitAsync: () => Promise<Bit | null>;
};

export const PlayerBitContext = createContext<PlayerBitContextType>({
  bit: null,
  createOrLoadBitAsync: async () => null,
});
