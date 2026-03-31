import { describe, expect, it } from 'vitest';

import { ok, err, isOk, isErr } from '../../../src/shared/index.js';
import type { Result } from '../../../src/shared/index.js';

/**
 * Protege las primitivas de Result usadas en todo el dominio y la capa de aplicación.
 */
describe('Utilidad Result', () => {
  /**
   * Verifica que ok empaqueta el valor y pasa el predicado isOk.
   */
  it('debe crear un resultado exitoso con ok()', () => {
    const result = ok(42);

    expect(result).toEqual({ ok: true, value: 42 });
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
  });

  /**
   * Verifica que err empaqueta el error y pasa el predicado isErr.
   */
  it('debe crear un resultado fallido con err()', () => {
    const result = err('fallo');

    expect(result).toEqual({ ok: false, error: 'fallo' });
    expect(isErr(result)).toBe(true);
    expect(isOk(result)).toBe(false);
  });

  /**
   * Confirma que isOk discrimina correctamente en un union de tipos.
   */
  it('debe permitir discriminar el valor exitoso sin casting manual', () => {
    const result: Result<number, string> = ok(99);

    if (isOk(result)) {
      expect(result.value).toBe(99);
    } else {
      throw new Error('Se esperaba un resultado exitoso');
    }
  });

  /**
   * Confirma que isErr discrimina correctamente en un union de tipos.
   */
  it('debe permitir discriminar el error sin casting manual', () => {
    const result: Result<number, string> = err('error');

    if (isErr(result)) {
      expect(result.error).toBe('error');
    } else {
      throw new Error('Se esperaba un resultado fallido');
    }
  });
});
