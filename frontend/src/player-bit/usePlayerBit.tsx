import { useContext } from "react";
import { PlayerBitContext } from "./context";

export function usePlayerBit() {
    const context = useContext(PlayerBitContext);

    if (context === null) {
      throw new Error("usePlayerBit must be used within a PlayerBitProvider");
    }

    return context;
  }