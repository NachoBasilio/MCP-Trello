import { describe, it, expect } from 'vitest';
import {
  DomainError,
  ErrorCode,
  isDomainError,
  createNotFoundError,
  createRateLimitError,
  createAuthError,
  createValidationError,
  createAmbiguousError,
  createInternalError,
  createBoardIdRequiredError,
  createCardAmbiguousError,
  createCardNotFoundError,
  createCommentEmptyError,
  createBoardNotFoundError,
  createRateLimitedError,
  createTrelloApiError,
  createBoardAmbiguousError,
} from '../../../../src/domain/errors/DomainError.js';

/**
 * Cubre la jerarquia de errores de dominio y las fabricas semanticas expuestas.
 */
describe('Errores de dominio (DomainError)', () => {
  /**
   * Verifica la construccion base del error y el transporte opcional de contexto.
   */
  describe('Constructor', () => {
    it('debe crear un DomainError con codigo y mensaje', () => {
      const error = new DomainError(ErrorCode.NotFound, 'Resource not found');
      expect(error.code).toBe(ErrorCode.NotFound);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('DomainError');
    });

    it('debe crear un DomainError con contexto adicional', () => {
      const error = new DomainError(ErrorCode.Validation, 'Invalid input', {
        field: 'email',
        value: 'invalid',
      });
      expect(error.context).toEqual({
        field: 'email',
        value: 'invalid',
      });
    });
  });

  /**
   * Confirma el type guard para distinguir errores de dominio de otros errores.
   */
  describe('Predicado de tipo isDomainError', () => {
    it('debe devolver true para instancias de DomainError', () => {
      const error = new DomainError(ErrorCode.NotFound, 'Not found');
      expect(isDomainError(error)).toBe(true);
    });

    it('debe devolver false para un Error comun', () => {
      const error = new Error('Regular error');
      expect(isDomainError(error)).toBe(false);
    });

    it('debe devolver false para null', () => {
      expect(isDomainError(null)).toBe(false);
    });
  });

  /**
   * Verifica la fabrica para recursos inexistentes dentro del dominio.
   */
  describe('Fabrica createNotFoundError', () => {
    it('debe crear un error NOT_FOUND', () => {
      const error = createNotFoundError('Card', 'card123');
      expect(error.code).toBe(ErrorCode.NotFound);
      expect(error.message).toBe('Card not found: card123');
    });
  });

  /**
   * Valida los errores de rate limit generales con y sin tiempo de reintento.
   */
  describe('Fabrica createRateLimitError', () => {
    it('debe crear un error RATE_LIMIT sin informacion de reintento', () => {
      const error = createRateLimitError();
      expect(error.code).toBe(ErrorCode.RateLimit);
      expect(error.message).toBe('Rate limited by Trello API');
    });

    it('debe crear un error RATE_LIMIT con informacion de reintento', () => {
      const error = createRateLimitError(5);
      expect(error.message).toBe('Rate limited by Trello API. Retry after 5s');
    });
  });

  /**
   * Asegura mensajes personalizados o por defecto para errores de autenticacion.
   */
  describe('Fabrica createAuthError', () => {
    it('debe crear un error AUTH con mensaje personalizado', () => {
      const error = createAuthError('Invalid API key');
      expect(error.code).toBe(ErrorCode.Auth);
      expect(error.message).toBe('Invalid API key');
    });

    it('debe crear un error AUTH con mensaje por defecto', () => {
      const error = createAuthError();
      expect(error.message).toBe('Authentication failed');
    });
  });

  /**
   * Verifica el transporte de contexto para errores de validacion.
   */
  describe('Fabrica createValidationError', () => {
    it('debe crear un error VALIDATION', () => {
      const error = createValidationError('Invalid email', { field: 'email' });
      expect(error.code).toBe(ErrorCode.Validation);
      expect(error.message).toBe('Invalid email');
      expect(error.context).toEqual({ field: 'email' });
    });
  });

  /**
   * Cubre los errores para resultados ambiguos durante una busqueda.
   */
  describe('Fabrica createAmbiguousError', () => {
    it('debe crear un error AMBIGUOUS', () => {
      const matches = [
        { id: '1', name: 'Card A' },
        { id: '2', name: 'Card B' },
      ];
      const error = createAmbiguousError('Card', matches, 'card');
      expect(error.code).toBe(ErrorCode.Ambiguous);
      expect(error.context).toEqual({ matches, searchTerm: 'card' });
    });
  });

  /**
   * Verifica la fabrica para errores internos no recuperables.
   */
  describe('Fabrica createInternalError', () => {
    it('debe crear un error INTERNAL', () => {
      const error = createInternalError('Unexpected error', { stack: '...' });
      expect(error.code).toBe(ErrorCode.Internal);
      expect(error.message).toBe('Unexpected error');
    });
  });

  /**
   * Confirma el error semantico cuando falta el board por defecto requerido.
   */
  describe('Fabrica createBoardIdRequiredError', () => {
    it('debe crear un error BOARD_ID_REQUIRED', () => {
      const error = createBoardIdRequiredError();
      expect(error.code).toBe(ErrorCode.BoardIdRequired);
      expect(error.message).toContain('TRELLO_DEFAULT_BOARD_ID');
    });
  });

  /**
   * Cubre la variante especializada para tarjetas ambiguas.
   */
  describe('Fabrica createCardAmbiguousError', () => {
    it('debe crear un error CARD_AMBIGUOUS', () => {
      const matches = [
        { id: '1', name: 'Card A', idList: 'list1' },
        { id: '2', name: 'Card B', idList: 'list2' },
      ];
      const error = createCardAmbiguousError(matches, 'card');
      expect(error.code).toBe(ErrorCode.CardAmbiguous);
      expect(error.message).toContain('Ambiguous card name');
      expect(error.context?.matches).toEqual(matches);
    });
  });

  /**
   * Verifica la fabrica dedicada cuando no se encuentra una tarjeta buscada.
   */
  describe('Fabrica createCardNotFoundError', () => {
    it('debe crear un error CARD_NOT_FOUND', () => {
      const error = createCardNotFoundError('ghost card');
      expect(error.code).toBe(ErrorCode.CardNotFound);
      expect(error.message).toContain('ghost card');
      expect(error.context).toEqual({ searchTerm: 'ghost card' });
    });
  });

  /**
   * Confirma el error semantico para comentarios vacios.
   */
  describe('Fabrica createCommentEmptyError', () => {
    it('debe crear un error COMMENT_EMPTY', () => {
      const error = createCommentEmptyError();
      expect(error.code).toBe(ErrorCode.CommentEmpty);
      expect(error.message).toBe('Comment text cannot be empty');
    });
  });

  /**
   * Verifica la fabrica cuando el board no existe o no es accesible.
   */
  describe('Fabrica createBoardNotFoundError', () => {
    it('debe crear un error BOARD_NOT_FOUND', () => {
      const error = createBoardNotFoundError();
      expect(error.code).toBe(ErrorCode.BoardNotFound);
      expect(error.message).toBe('Board not found or inaccessible');
    });
  });

  /**
   * Cubre la variante especializada de rate limit con retryAfter explicito.
   */
  describe('Fabrica createRateLimitedError', () => {
    it('debe crear un error RATE_LIMITED', () => {
      const error = createRateLimitedError(10);
      expect(error.code).toBe(ErrorCode.RateLimited);
      expect(error.message).toContain('Retry after 10s');
      expect(error.context?.retryAfter).toBe(10);
    });
  });

  /**
   * Verifica la adaptacion de errores crudos de Trello a un error de dominio tipado.
   */
  describe('Fabrica createTrelloApiError', () => {
    it('debe crear un error TRELLO_API_ERROR', () => {
      const error = createTrelloApiError('Invalid request', { status: 400 });
      expect(error.code).toBe(ErrorCode.TrelloApiError);
      expect(error.message).toBe('Trello API error: Invalid request');
      expect(error.context).toEqual({ status: 400 });
    });
  });

  /**
   * Verifica la fabrica para boards ambiguos con match normalizado exacto.
   */
  describe('Fabrica createBoardAmbiguousError', () => {
    it('debe crear un error BOARD_AMBIGUOUS', () => {
      const matches = [
        { id: 'board-1', name: 'Platform Roadmap' },
        { id: 'board-2', name: 'platform roadmap' },
      ];
      const error = createBoardAmbiguousError(matches, 'Platform Roadmap');
      expect(error.code).toBe(ErrorCode.BoardAmbiguous);
      expect(error.message).toBe('Ambiguous board name');
      expect(error.context).toEqual({ matches, searchTerm: 'Platform Roadmap' });
    });
  });
});
