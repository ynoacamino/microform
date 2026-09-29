import { describe, expect, it, vi } from "vitest";
import type { NotifyAdapter } from "../adapters/ports.ts";
import { formatMutationError, handleSubmitFlow } from "./submit.ts";

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
  it("une graphQLErrors con salto de línea", () => {
    expect(
      formatMutationError({
        graphQLErrors: [{ message: "uno" }, { message: "dos" }],
      }),
    ).toBe("uno\ndos");
  });

  it("acepta graphQLErrors como strings", () => {
    expect(formatMutationError({ graphQLErrors: ["a", "b"] })).toBe("a\nb");
  });

  it("prefiere networkError cuando no hay graphQLErrors útiles", () => {
    expect(formatMutationError({ networkError: { message: "sin red" } })).toBe("sin red");
    expect(formatMutationError({ networkError: "corte" })).toBe("corte");
  });

  it("Error instancia devuelve su message", () => {
    expect(formatMutationError(new Error("explotó"))).toBe("explotó");
  });

  it("string pasa directo", () => {
    expect(formatMutationError("fallo simple")).toBe("fallo simple");
  });

  it("number usa String(error)", () => {
    expect(formatMutationError(42)).toBe("42");
  });

  it("falsy y objetos vacíos caen al fallback", () => {
    expect(formatMutationError(undefined)).toBe("Ocurrió un error inesperado");
    expect(formatMutationError(null)).toBe("Ocurrió un error inesperado");
    expect(formatMutationError("")).toBe("Ocurrió un error inesperado");
    expect(formatMutationError({})).toBe("Ocurrió un error inesperado");
    expect(formatMutationError({ graphQLErrors: [] })).toBe("Ocurrió un error inesperado");
  });

  it("message no-string cae al fallback", () => {
    expect(formatMutationError({ message: 123 })).toBe("Ocurrió un error inesperado");
  });
});

describe("handleSubmitFlow", () => {
  it("éxito: limpia vars, notifica y llama callbacks, retorna true", async () => {
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

  it("res.error: notify.error con detalle y retorna false sin callbacks", async () => {
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

  it("throw: notify.error con mensaje formateado y retorna false", async () => {
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

  it("sin mensajes opcionales usa el detalle como mensaje", async () => {
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
