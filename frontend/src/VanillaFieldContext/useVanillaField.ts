import { useEffect, useState } from "react";
import {
  VanillaFieldContext,
  vanillaFieldContext,
} from "./VanillaFieldContext";

export function useVanillaField(): VanillaFieldContext {
  const [, forceUpdate] = useState<object>({});

  useEffect(() => {
    // Only rerender if we explicitly want to watch for changes
    const unsubscribe = vanillaFieldContext.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  return vanillaFieldContext;
}
