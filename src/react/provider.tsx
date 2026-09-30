import type { ReactElement, ReactNode } from "react";
import { createContext, useContext } from "react";
import type { Microform } from "@/core/registry.ts";

const MicroformContext = createContext<Microform<string> | null>(null);

export function MicroformProvider({
  value,
  children,
}: {
  value: Microform<string>;
  children: ReactNode;
}): ReactElement {
  return <MicroformContext.Provider value={value}>{children}</MicroformContext.Provider>;
}

export function useMicroformOptional(): Microform<string> | null {
  return useContext(MicroformContext);
}

export function useMicroform(): Microform<string> {
  const microform = useContext(MicroformContext);
  if (!microform) {
    throw new Error("useMicroform() requiere <MicroformProvider value={microform}>.");
  }
  return microform;
}
