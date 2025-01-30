import { useEffect, useState } from "react";
import { VanillaFieldContext } from "./VanillaFieldContext";

export function useVanillaField() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Only rerender if we explicitly want to watch for changes
    const unsubscribe = VanillaFieldContext.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  return VanillaFieldContext;
}
