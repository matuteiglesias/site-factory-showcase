export type AppResult<T, E extends string = string> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: E;
      message?: string;
      cause?: unknown;
    };

export function ok<T>(value: T): AppResult<T, never> {
  return { ok: true, value };
}

export function err<E extends string>(
  error: E,
  message?: string,
  cause?: unknown,
): AppResult<never, E> {
  return { ok: false, error, message, cause };
}
