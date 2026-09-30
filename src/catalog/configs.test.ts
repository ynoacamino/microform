import { describe, expect, expectTypeOf, it } from "vitest";
import type { BuiltInType } from "@/catalog/configs.ts";
import { BUILT_IN_TYPES } from "@/catalog/configs.ts";

describe("builtin-types", () => {
  it("includes text/async_select/checkbox_group and excludes rich_text", () => {
    expectTypeOf<Extract<BuiltInType, "text">>().toEqualTypeOf<"text">();
    expectTypeOf<Extract<BuiltInType, "async_select">>().toEqualTypeOf<"async_select">();
    expectTypeOf<Extract<BuiltInType, "checkbox_group">>().toEqualTypeOf<"checkbox_group">();
    expectTypeOf<Extract<BuiltInType, "rich_text">>().toEqualTypeOf<never>();
    expect(BUILT_IN_TYPES).toContain("text");
    expect(BUILT_IN_TYPES).toContain("async_select");
    expect(BUILT_IN_TYPES).toContain("checkbox_group");
    expect((BUILT_IN_TYPES as readonly string[]).includes("rich_text")).toBe(false);
  });
});
