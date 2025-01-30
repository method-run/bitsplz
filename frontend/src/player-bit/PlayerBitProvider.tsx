import { useCallback, useState } from "react";
import { PlayerBitContext } from "./context";
import { createOrLoadPlayerBitAsync } from "./storage";
import { vanillaFieldContext } from "../VanillaFieldContext";

// const {vanillaFieldContext} = window;
// console.log('PlayerBitProvider.jsx', vanillaFieldContext);
// if (!vanillaFieldContext) {
//     throw new Error("window.vanillaFieldContext not found");
// }

export function PlayerBitProvider(props) {
  const [bit, setBit] = useState(null);

  const createOrLoadBitAsync = useCallback(async () => {
    const bit = await createOrLoadPlayerBitAsync();
    setBit(bit);
    vanillaFieldContext.updateBit(bit.id, bit);
    return bit;
  }, []);

  return (
    <PlayerBitContext.Provider
      {...props}
      value={{ bit, createOrLoadBitAsync }}
    />
  );
}