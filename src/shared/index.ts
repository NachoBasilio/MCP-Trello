/**
 * Utilidad compartida para representar operaciones exitosas o fallidas sin depender de excepciones.
 */
export type Result<Value, ErrorType> =
  | { ok: true; value: Value }
  | { ok: false; error: ErrorType };

/**
 * Crea un resultado exitoso con el valor provisto.
 */
export const ok = <Value>(value: Value): Result<Value, never> => {
  return { ok: true, value };
};

/**
 * Crea un resultado fallido con el error provisto.
 */
export const err = <ErrorType>(error: ErrorType): Result<never, ErrorType> => {
  return { ok: false, error };
};

/**
 * Informa si el resultado recibido corresponde al camino exitoso.
 */
export const isOk = <Value, ErrorType>(result: Result<Value, ErrorType>): result is { ok: true; value: Value } => {
  return result.ok;
};

/**
 * Informa si el resultado recibido corresponde al camino fallido.
 */
export const isErr = <Value, ErrorType>(
  result: Result<Value, ErrorType>
): result is { ok: false; error: ErrorType } => {
  return !result.ok;
};
