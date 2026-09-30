import { describe, expectTypeOf, it } from "vitest";
import type { CheckboxGroupOption, DrawerSelectOption, ModalPickerSettings, PersonOption } from "./options";

describe("options", () => {
  it("Drawer assignable to Person", () => {
    expectTypeOf<DrawerSelectOption>().toMatchTypeOf<PersonOption>();
    expectTypeOf<DrawerSelectOption>().toHaveProperty("triggerLabel");
  });

  it("Checkbox accepts badge/disabled", () => {
    expectTypeOf<CheckboxGroupOption>().toHaveProperty("badge");
    expectTypeOf<CheckboxGroupOption>().toHaveProperty("disabled");
    const opt: CheckboxGroupOption = {
      key: "k",
      value: "v",
      label: "L",
      badge: "3",
      disabled: true,
    };
    expectTypeOf(opt).toMatchTypeOf<CheckboxGroupOption>();
  });

  it("Modal requires getOption with (item) => PersonOption signature", () => {
    type Settings = ModalPickerSettings<{ id: string }>;
    expectTypeOf<Settings["getOption"]>().parameter(0).toEqualTypeOf<{ id: string }>();
    expectTypeOf<Settings["getOption"]>().returns.toEqualTypeOf<PersonOption>();
    // @ts-expect-error getOption es requerido
    const missing: Settings = { modalTitle: "T" };
    expectTypeOf(missing).toMatchTypeOf<Settings>();
  });
});
