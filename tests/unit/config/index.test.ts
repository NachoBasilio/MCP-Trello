import { describe, expect, it } from 'vitest';

import { DomainError, ErrorCode } from '../../../src/domain/index.js';
import { loadConfig } from '../../../src/config/index.js';

/**
 * Fija el contrato observable de configuracion consumido por el entrypoint del bootstrap.
 */
describe('Configuracion del bootstrap', () => {
  /**
   * Verifica defaults utiles para arrancar el bootstrap sin duplicar configuracion en el entrypoint.
   */
  it('debe aplicar el base URL por defecto cuando el entorno minimo es valido', () => {
    const config = loadConfig({
      TRELLO_API_KEY: 'key-123',
      TRELLO_TOKEN: 'token-123',
    });

    expect(config).toEqual({
      TRELLO_API_KEY: 'key-123',
      TRELLO_TOKEN: 'token-123',
      TRELLO_API_BASE_URL: 'https://api.trello.com/1',
    });
  });

  /**
   * Confirma que los faltantes del entorno fallen temprano con detalle accionable.
   */
  it('debe fallar con un mensaje accionable cuando falta una credencial obligatoria', () => {
    const loadWithoutApiKey = (): void => {
      loadConfig({
        TRELLO_TOKEN: 'token-123',
      });
    };

    expect(loadWithoutApiKey).toThrow(DomainError);

    try {
      loadWithoutApiKey();
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe(ErrorCode.Configuration);
      expect((error as DomainError).message).toContain('TRELLO_API_KEY: TRELLO_API_KEY is required');
    }
  });

  /**
   * Valida que los valores malformados conserven detalle suficiente para corregir el entorno.
   */
  it('debe fallar con un mensaje accionable cuando el base URL es invalido', () => {
    const loadWithInvalidBaseUrl = (): void => {
      loadConfig({
        TRELLO_API_KEY: 'key-123',
        TRELLO_TOKEN: 'token-123',
        TRELLO_API_BASE_URL: 'trello-local',
      });
    };

    expect(loadWithInvalidBaseUrl).toThrow(DomainError);

    try {
      loadWithInvalidBaseUrl();
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe(ErrorCode.Configuration);
      expect((error as DomainError).message).toContain(
        'TRELLO_API_BASE_URL: TRELLO_API_BASE_URL must be a valid URL'
      );
    }
  });
});
