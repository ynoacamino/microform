import { describe, expect, it, vi } from "vitest";
import type { FieldRendererFn } from "@/core/control.ts";
import { defineControl } from "@/core/define-control.ts";
import { createMicroform, resolveRenderer } from "@/core/registry.ts";

const TEXT_TYPE = "text" as const;
interface TextFieldConfig {
  type: typeof TEXT_TYPE;
}

const COLOR_TYPE = "color" as const;
interface ColorFieldConfig {
  type: typeof COLOR_TYPE;
  swatches?: string[];
}

const RATING_TYPE = "rating" as const;
interface RatingFieldConfig {
  type: typeof RATING_TYPE;
  max?: number;
}

function setup() {
  const renderText: FieldRendererFn = () => "text-ui";
  const textControl = defineControl<typeof TEXT_TYPE, TextFieldConfig>({
    type: TEXT_TYPE,
    renderer: renderText,
  });
  const colorControl = defineControl<typeof COLOR_TYPE, ColorFieldConfig>({
    type: COLOR_TYPE,
    renderer: () => "color-ui",
  });
  const ratingControl = defineControl<typeof RATING_TYPE, RatingFieldConfig>({
    type: RATING_TYPE,
    renderer: () => "rating-ui",
  });
  return { renderText, textControl, colorControl, ratingControl };
}

describe("createMicroform", () => {
  it("resolves built-ins registered at creation", () => {
    const { textControl, renderText } = setup();
    const microform = createMicroform<typeof TEXT_TYPE>({ controls: [textControl] });
    expect(resolveRenderer(microform, "text")).toBe(renderText);
    expect(microform.has("text")).toBe(true);
    expect(microform.types()).toEqual(["text"]);
  });

  it("registers color/rating customs and lists them in types()", () => {
    const { textControl, colorControl, ratingControl } = setup();
    const microform = createMicroform<typeof TEXT_TYPE, typeof COLOR_TYPE | typeof RATING_TYPE>({
      controls: [textControl],
    });
    microform.register(colorControl.type, colorControl.renderer);
    microform.register(ratingControl.type, ratingControl.renderer);
    expect(resolveRenderer(microform, "color")?.({ props: {} })).toBe("color-ui");
    expect(resolveRenderer(microform, "rating")?.({ props: {} })).toBe("rating-ui");
    expect(microform.types()).toEqual(["text", "color", "rating"]);
  });

  it("allows overriding a built-in", () => {
    const { textControl } = setup();
    const microform = createMicroform<typeof TEXT_TYPE>({ controls: [textControl] });
    const custom = vi.fn(() => "custom-text");
    microform.register("text", custom);
    expect(resolveRenderer(microform, "text")).toBe(custom);
  });

  it("isolates instances from each other", () => {
    const { textControl } = setup();
    const a = createMicroform<typeof TEXT_TYPE, typeof COLOR_TYPE>({ controls: [textControl] });
    const b = createMicroform<typeof TEXT_TYPE, typeof COLOR_TYPE>({ controls: [textControl] });
    a.register("color", () => "a-color");
    expect(resolveRenderer(b, "color")).toBeUndefined();
    expect(b.types()).toEqual(["text"]);
  });

  it("returns undefined for unknown types", () => {
    const { textControl } = setup();
    const microform = createMicroform<typeof TEXT_TYPE, typeof COLOR_TYPE>({ controls: [textControl] });
    expect(resolveRenderer(microform, "color")).toBeUndefined();
    expect(microform.has("color")).toBe(false);
  });
});
