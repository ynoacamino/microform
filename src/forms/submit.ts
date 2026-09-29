import type { NotifyAdapter } from "../adapters/ports.ts";
import { cleanFormVariables } from "./clean-form-variables.ts";

const FALLBACK_MESSAGE = "Ocurrió un error inesperado";

/** Error estructural generalizado, agnóstico al cliente GraphQL. */
export interface MutationErrorLike {
  message?: unknown;
  graphQLErrors?: Array<{ message?: unknown } | unknown>;
  networkError?: { message?: unknown } | unknown;
}

function messageOf(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value === "" ? undefined : value;
  }
  if (typeof value === "object" && value !== null && "message" in value) {
    const message: unknown = value.message;
    if (typeof message === "string" && message !== "") {
      return message;
    }
  }
  return undefined;
}

export function formatMutationError(error: MutationErrorLike | Error | unknown): string {
  if (!error) {
    return FALLBACK_MESSAGE;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object") {
    if ("graphQLErrors" in error) {
      const list: unknown = error.graphQLErrors;
      if (Array.isArray(list) && list.length > 0) {
        const parts: string[] = [];
        for (const entry of list) {
          const part = messageOf(entry);
          if (part !== undefined) {
            parts.push(part);
          }
        }
        if (parts.length > 0) {
          return parts.join("\n");
        }
      }
    }
    if ("networkError" in error) {
      const viaNetwork = messageOf(error.networkError);
      if (viaNetwork !== undefined) {
        return viaNetwork;
      }
    }
    const direct = messageOf(error);
    if (direct !== undefined) {
      return direct;
    }
  }
  const text = String(error);
  if (text !== "" && text !== "[object Object]") {
    return text;
  }
  return FALLBACK_MESSAGE;
}

export interface SubmitFlowArgs {
  mutation: (vars: Record<string, unknown>) => Promise<{ data?: unknown; error?: unknown }>;
  vars: Record<string, unknown>;
  notify: NotifyAdapter;
  onSuccess?: () => void;
  resetForm?: () => void;
  invalidate?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export async function handleSubmitFlow(args: SubmitFlowArgs): Promise<boolean> {
  const { mutation, vars, notify, onSuccess, resetForm, invalidate, successMessage, errorMessage } = args;
  try {
    const cleaned = cleanFormVariables(vars) ?? {};
    const res = await mutation(cleaned);
    if (res.error) {
      const detail = formatMutationError(res.error);
      if (errorMessage === undefined) {
        notify.error(detail);
      } else {
        notify.error(errorMessage, detail);
      }
      return false;
    }
    if (successMessage !== undefined) {
      notify.success(successMessage);
    }
    resetForm?.();
    invalidate?.();
    onSuccess?.();
    return true;
  } catch (err) {
    const detail = formatMutationError(err);
    if (errorMessage === undefined) {
      notify.error(detail);
    } else {
      notify.error(errorMessage, detail);
    }
    return false;
  }
}
