import { describe, expect, it } from "vitest";
import type { FormShellPort } from "./form-shell.ts";

describe("FormShellPort", () => {
  it("acepta un objeto vacío", () => {
    const port: FormShellPort = {};
    expect(port).toEqual({});
  });

  it("acepta Provider y useController", () => {
    const Provider = { displayName: "FormProvider" };
    const useController = { displayName: "useController" };
    const port: FormShellPort = { Provider, useController };
    expect(port.Provider).toBe(Provider);
    expect(port.useController).toBe(useController);
  });
});
