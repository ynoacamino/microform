import { describe, expect, it, vi } from "vitest";
import type { NotifyAdapter } from "./ports";
import { formatMutationError, handleSubmitFlow } from "./submit";

function makeNotify(): NotifyAdapter & {
  successCalls: string[];
  errorCalls: Array<{ message: string; description?: string }>;
} {
  const successCalls: string[] = [];
  const errorCalls: Array<{ message: string; description?: string }> = [];
  return {
    successCalls,
    errorCalls,
    success: (message: string): void => {
      successCalls.push(message);
    },
    error: (message: string, description?: string): void => {
      errorCalls.push({ message, description });
    },
  };
}

describe("formatMutationError", () => {
  it("joins graphQLErrors with newline", () => {
    expect(
      formatMutationError({
        graphQLErrors: [{ message: "uno" }, { message: "dos" }],
      }),
    ).toBe("uno\ndos");
  });

  it("accepts graphQLErrors as strings", () => {
    expect(formatMutationError({ graphQLErrors: ["a", "b"] })).toBe("a\nb");
  });

  it("prefers networkError when no useful graphQLErrors", () => {
    expect(formatMutationError({ networkError: { message: "sin red" } })).toBe("sin red");
    expect(formatMutationError({ networkError: "corte" })).toBe("corte");
  });

  it("Error instance returns its message", () => {
    expect(formatMutationError(new Error("explotó"))).toBe("explotó");
  });

  it("string passes through", () => {
    expect(formatMutationError("fallo simple")).toBe("fallo simple");
  });

  it("number uses String(error)", () => {
    expect(formatMutationError(42)).toBe("42");
  });

  it("falsy and empty objects fall back", () => {
    expect(formatMutationError(undefined)).toBe("Ocurrió un error inesperado");
    expect(formatMutationError(null)).toBe("Ocurrió un error inesperado");
    expect(formatMutationError("")).toBe("Ocurrió un error inesperado");
    expect(formatMutationError({})).toBe("Ocurrió un error inesperado");
    expect(formatMutationError({ graphQLErrors: [] })).toBe("Ocurrió un error inesperado");
  });

  it("non-string message falls back", () => {
    expect(formatMutationError({ message: 123 })).toBe("Ocurrió un error inesperado");
  });
});

describe("handleSubmitFlow", () => {
  it("success: cleans vars, notifies and calls callbacks, returns true", async () => {
    const notify = makeNotify();
    const onSuccess = vi.fn();
    const resetForm = vi.fn();
    const invalidate = vi.fn();
    const mutation = vi.fn(async (received: Record<string, unknown>) => {
      expect(received).toEqual({ name: "x", nick: null });
      return { data: { ok: true } };
    });
    const ok = await handleSubmitFlow({
      mutation,
      vars: { name: "x", nick: "  " },
      notify,
      onSuccess,
      resetForm,
      invalidate,
      successMessage: "Guardado",
      errorMessage: "Falló",
    });
    expect(ok).toBe(true);
    expect(mutation).toHaveBeenCalledOnce();
    expect(notify.successCalls).toEqual(["Guardado"]);
    expect(notify.errorCalls).toEqual([]);
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(resetForm).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
  });

  it("res.error: notify.error with detail and returns false without callbacks", async () => {
    const notify = makeNotify();
    const onSuccess = vi.fn();
    const ok = await handleSubmitFlow({
      mutation: async () => ({ error: { message: "duplicado" } }),
      vars: {},
      notify,
      onSuccess,
      successMessage: "Guardado",
      errorMessage: "Falló",
    });
    expect(ok).toBe(false);
    expect(notify.errorCalls).toEqual([{ message: "Falló", description: "duplicado" }]);
    expect(notify.successCalls).toEqual([]);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("throw: notify.error with formatted message and returns false", async () => {
    const notify = makeNotify();
    const ok = await handleSubmitFlow({
      mutation: async () => {
        throw new Error("boom");
      },
      vars: {},
      notify,
      errorMessage: "Falló",
    });
    expect(ok).toBe(false);
    expect(notify.errorCalls).toEqual([{ message: "Falló", description: "boom" }]);
  });

  it("without optional messages uses detail as message", async () => {
    const notify = makeNotify();
    const ok = await handleSubmitFlow({
      mutation: async () => ({ data: { ok: true } }),
      vars: {},
      notify,
    });
    expect(ok).toBe(true);
    expect(notify.successCalls).toEqual([]);
  });
});
