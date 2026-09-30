import { describe, expect, it } from "vitest";
import { createMemoryStorage } from "../adapters/memory-storage";
import { createPersistenceKey, readPersistedValue, writePersistedValue } from "./persistence";

describe("createPersistenceKey", () => {
  it("uses default prefix", () => {
    expect(createPersistenceKey("draft")).toBe("form-persist:draft");
  });

  it("supports custom prefix", () => {
    expect(createPersistenceKey("draft", "app:")).toBe("app:draft");
  });
});

describe("persistence roundtrip", () => {
  it("writes and reads strings, numbers and string arrays", () => {
    const storage = createMemoryStorage();
    writePersistedValue(storage, "a", "hello");
    writePersistedValue(storage, "b", 42);
    writePersistedValue(storage, "c", ["x", "y"]);
    expect(readPersistedValue(storage, "a")).toBe("hello");
    expect(readPersistedValue(storage, "b")).toBe(42);
    expect(readPersistedValue(storage, "c")).toEqual(["x", "y"]);
  });

  it("reads custom-prefix keys", () => {
    const storage = createMemoryStorage();
    writePersistedValue(storage, "draft", "hi", "app:");
    expect(readPersistedValue(storage, "draft", "app:")).toBe("hi");
    expect(readPersistedValue(storage, "draft")).toBeUndefined();
  });

  it("returns undefined for missing or corrupt JSON", () => {
    const storage = createMemoryStorage({ "form-persist:bad": "{oops" });
    expect(readPersistedValue(storage, "missing")).toBeUndefined();
    expect(readPersistedValue(storage, "bad")).toBeUndefined();
  });

  it("rejects non-string arrays", () => {
    const storage = createMemoryStorage({ "form-persist:n": "[1,2]" });
    expect(readPersistedValue(storage, "n")).toBeUndefined();
  });

  it("skips File[] (structural, no DOM lib)", () => {
    const storage = createMemoryStorage();
    writePersistedValue(storage, "f", [{ name: "a.png" }, { name: "b.png" }]);
    expect(storage.dump()["form-persist:f"]).toBeUndefined();
    expect(readPersistedValue(storage, "f")).toBeUndefined();
  });

  it("skips empty string, undefined and null", () => {
    const storage = createMemoryStorage();
    writePersistedValue(storage, "e", "");
    writePersistedValue(storage, "u", undefined);
    writePersistedValue(storage, "n", null);
    expect(storage.dump()).toEqual({});
  });
});
