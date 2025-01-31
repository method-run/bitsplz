import { useCallback, useEffect, useState } from "react";
import { PlayerBitContext } from "./context";
import { Bit, createOrLoadPlayerBitAsync } from "./storage";
import { vanillaFieldContext } from "../VanillaFieldContext";

export function PlayerBitProvider(props: React.PropsWithChildren) {
  const [bit, setBit] = useState<Bit | null>(null);

  const createOrLoadBitAsync = useCallback(async () => {
    const bit = await createOrLoadPlayerBitAsync();
    setBit(bit);
    vanillaFieldContext.updateBit(bit.id, bit);
  }, []);

  useEffect(() => {
    if (bit) {
      vanillaFieldContext.updateBit(bit.id, bit);
    }
  }, [bit]);

  return (
    <PlayerBitContext.Provider
      {...props}
      value={{ bit, createOrLoadBitAsync, setBit }}
    />
  );
}
