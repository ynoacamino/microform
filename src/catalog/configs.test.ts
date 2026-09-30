import { describe, expect, expectTypeOf, it } from "vitest";
import type { BuiltInType } from "./configs";
import { BUILT_IN_TYPES } from "./configs";

describe("builtin-types", () => {
  it("minimal core: primitives in, specialized out (userland recipes)", () => {
    expectTypeOf<Extract<BuiltInType, "text">>().toEqualTypeOf<"text">();
    expectTypeOf<Extract<BuiltInType, "async_select">>().toEqualTypeOf<"async_select">();
    expectTypeOf<Extract<BuiltInType, "checkbox_group">>().toEqualTypeOf<"checkbox_group">();
    expectTypeOf<Extract<BuiltInType, "rich_text">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<BuiltInType, "person_select">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<BuiltInType, "modal_picker">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<BuiltInType, "drawer_select">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<BuiltInType, "upload_file">>().toEqualTypeOf<never>();
    expectTypeOf<Extract<BuiltInType, "avatar_upload">>().toEqualTypeOf<never>();
    expect(BUILT_IN_TYPES).toContain("text");
    expect(BUILT_IN_TYPES).toContain("async_select");
    expect(BUILT_IN_TYPES).toContain("checkbox_group");
    for (const specialized of [
      "rich_text",
      "person_select",
      "async_person_select",
      "modal_picker",
      "async_modal_picker",
      "drawer_select",
      "upload_file",
      "avatar_upload",
    ]) {
      expect((BUILT_IN_TYPES as readonly string[]).includes(specialized)).toBe(false);
    }
  });
});
