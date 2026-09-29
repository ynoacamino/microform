import { describe, expect, it } from "vitest";
import { getOptionLabel } from "./get-option-label.ts";

describe("getOptionLabel", () => {
  it("retorna la etiqueta del registro", () => {
    expect(getOptionLabel({ DNI: "Documento" }, "DNI")).toBe("Documento");
  });

  it("retorna el valor cuando no hay etiqueta", () => {
    expect(getOptionLabel({}, "CE")).toBe("CE");
  });
});
