import { createContext, Dispatch, SetStateAction } from "react";
import { Bit } from "./storage";

type PlayerBitContextType = {
  bit: Bit | null;
  createOrLoadBitAsync: () => Promise<void>;
  setBit: Dispatch<SetStateAction<Bit | null>>;
};

export const PlayerBitContext = createContext<PlayerBitContextType>({
  bit: null,
  createOrLoadBitAsync: async () => {},
  setBit: () => {},
});
