import { describe, expect, expectTypeOf, it } from "vitest";
import type { ExtractQueryData, ExtractQueryItem, ExtractQueryVariables } from "./query.ts";

type VarsFn = (args: { variables: { take: number } }) => unknown;
type TupleHook = () => [{ data: { users: { items: { id: string }[] } } }, unknown];
type ObjectHook = () => { data: { id: string } };
type DirectHook = () => { data: { items: { id: string }[] } };
type NestedHook = () => { data: { users: { items: { id: string }[] } } };

describe("query types", () => {
  it("ExtractQueryVariables extrae variables", () => {
    expectTypeOf<ExtractQueryVariables<VarsFn>>().toEqualTypeOf<{
      take: number;
    }>();
    expect({ take: 1 }).toEqual({ take: 1 });
  });

  it("ExtractQueryData resuelve tupla y objeto", () => {
    expectTypeOf<ExtractQueryData<TupleHook>>().toEqualTypeOf<{
      users: { items: { id: string }[] };
    }>();
    expectTypeOf<ExtractQueryData<ObjectHook>>().toEqualTypeOf<{
      id: string;
    }>();
    expect({ id: "a" }).toEqual({ id: "a" });
  });

  it("ExtractQueryItem resuelve directo y anidado", () => {
    expectTypeOf<ExtractQueryItem<DirectHook>>().toEqualTypeOf<{
      id: string;
    }>();
    expectTypeOf<ExtractQueryItem<NestedHook>>().toEqualTypeOf<{
      id: string;
    }>();
    expect([{ id: "a" }]).toEqual([{ id: "a" }]);
  });
});
