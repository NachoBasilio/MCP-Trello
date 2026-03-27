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
} from '@errors/DomainError.js';

describe('DomainError', () => {
  describe('constructor', () => {
    it('should create a DomainError with code and message', () => {
      const error = new DomainError(ErrorCode.NotFound, 'Resource not found');
      expect(error.code).toBe(ErrorCode.NotFound);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('DomainError');
    });

    it('should create a DomainError with context', () => {
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

  describe('isDomainError', () => {
    it('should return true for DomainError instances', () => {
      const error = new DomainError(ErrorCode.NotFound, 'Not found');
      expect(isDomainError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isDomainError(error)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isDomainError(null)).toBe(false);
    });
  });

  describe('createNotFoundError', () => {
    it('should create a NOT_FOUND error', () => {
      const error = createNotFoundError('Card', 'card123');
      expect(error.code).toBe(ErrorCode.NotFound);
      expect(error.message).toBe('Card not found: card123');
    });
  });

  describe('createRateLimitError', () => {
    it('should create a RATE_LIMIT error without retry info', () => {
      const error = createRateLimitError();
      expect(error.code).toBe(ErrorCode.RateLimit);
      expect(error.message).toBe('Rate limited by Trello API');
    });

    it('should create a RATE_LIMIT error with retry info', () => {
      const error = createRateLimitError(5);
      expect(error.message).toBe('Rate limited by Trello API. Retry after 5s');
    });
  });

  describe('createAuthError', () => {
    it('should create an AUTH error with custom message', () => {
      const error = createAuthError('Invalid API key');
      expect(error.code).toBe(ErrorCode.Auth);
      expect(error.message).toBe('Invalid API key');
    });

    it('should create an AUTH error with default message', () => {
      const error = createAuthError();
      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('createValidationError', () => {
    it('should create a VALIDATION error', () => {
      const error = createValidationError('Invalid email', { field: 'email' });
      expect(error.code).toBe(ErrorCode.Validation);
      expect(error.message).toBe('Invalid email');
      expect(error.context).toEqual({ field: 'email' });
    });
  });

  describe('createAmbiguousError', () => {
    it('should create an AMBIGUOUS error', () => {
      const matches = [
        { id: '1', name: 'Card A' },
        { id: '2', name: 'Card B' },
      ];
      const error = createAmbiguousError('Card', matches, 'card');
      expect(error.code).toBe(ErrorCode.Ambiguous);
      expect(error.context).toEqual({ matches, searchTerm: 'card' });
    });
  });

  describe('createInternalError', () => {
    it('should create an INTERNAL error', () => {
      const error = createInternalError('Unexpected error', { stack: '...' });
      expect(error.code).toBe(ErrorCode.Internal);
      expect(error.message).toBe('Unexpected error');
    });
  });

  describe('createBoardIdRequiredError', () => {
    it('should create a BOARD_ID_REQUIRED error', () => {
      const error = createBoardIdRequiredError();
      expect(error.code).toBe(ErrorCode.BoardIdRequired);
      expect(error.message).toContain('TRELLO_DEFAULT_BOARD_ID');
    });
  });

  describe('createCardAmbiguousError', () => {
    it('should create a CARD_AMBIGUOUS error', () => {
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

  describe('createCardNotFoundError', () => {
    it('should create a CARD_NOT_FOUND error', () => {
      const error = createCardNotFoundError('ghost card');
      expect(error.code).toBe(ErrorCode.CardNotFound);
      expect(error.message).toContain('ghost card');
      expect(error.context).toEqual({ searchTerm: 'ghost card' });
    });
  });

  describe('createCommentEmptyError', () => {
    it('should create a COMMENT_EMPTY error', () => {
      const error = createCommentEmptyError();
      expect(error.code).toBe(ErrorCode.CommentEmpty);
      expect(error.message).toBe('Comment text cannot be empty');
    });
  });

  describe('createBoardNotFoundError', () => {
    it('should create a BOARD_NOT_FOUND error', () => {
      const error = createBoardNotFoundError();
      expect(error.code).toBe(ErrorCode.BoardNotFound);
      expect(error.message).toBe('Board not found or inaccessible');
    });
  });

  describe('createRateLimitedError', () => {
    it('should create a RATE_LIMITED error', () => {
      const error = createRateLimitedError(10);
      expect(error.code).toBe(ErrorCode.RateLimited);
      expect(error.message).toContain('Retry after 10s');
      expect(error.context?.retryAfter).toBe(10);
    });
  });

  describe('createTrelloApiError', () => {
    it('should create a TRELLO_API_ERROR error', () => {
      const error = createTrelloApiError('Invalid request', { status: 400 });
      expect(error.code).toBe(ErrorCode.TrelloApiError);
      expect(error.message).toBe('Trello API error: Invalid request');
      expect(error.context).toEqual({ status: 400 });
    });
  });
});
