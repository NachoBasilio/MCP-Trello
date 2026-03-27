import { describe, it, expect } from 'vitest';
import { CardQueryVO } from '../../../../src/domain/value-objects/CardQuery.js';

describe('CardQueryVO', () => {
  describe('create', () => {
    it('should create a CardQueryVO with required fields', () => {
      const query = CardQueryVO.create({ query: 'fix bug' });
      expect(query.query).toBe('fix bug');
      expect(query.limit).toBe(10);
      expect(query.boardId).toBeUndefined();
    });

    it('should create a CardQueryVO with all fields', () => {
      const query = CardQueryVO.create({
        query: 'auth fail',
        boardId: 'board123',
        limit: 25,
      });
      expect(query.query).toBe('auth fail');
      expect(query.boardId).toBe('board123');
      expect(query.limit).toBe(25);
    });

    it('should use default limit of 10', () => {
      const query = CardQueryVO.create({ query: 'test' });
      expect(query.limit).toBe(10);
    });
  });

  describe('getTerms', () => {
    it('should split query into terms', () => {
      const query = CardQueryVO.create({ query: 'fix auth bug' });
      expect(query.getTerms()).toEqual(['fix', 'auth', 'bug']);
    });

    it('should filter out terms shorter than 2 characters', () => {
      const query = CardQueryVO.create({ query: 'a fix auth b' });
      expect(query.getTerms()).toEqual(['fix', 'auth']);
    });

    it('should convert terms to lowercase', () => {
      const query = CardQueryVO.create({ query: 'FIX AUTH' });
      expect(query.getTerms()).toEqual(['fix', 'auth']);
    });

    it('should throw for empty query', () => {
      expect(() => CardQueryVO.create({ query: '' })).toThrow();
    });
  });

  describe('matchesCardName', () => {
    it('should return true when all terms match', () => {
      const query = CardQueryVO.create({ query: 'fix auth' });
      expect(query.matchesCardName('Fix authentication bug')).toBe(true);
    });

    it('should return false when any term does not match', () => {
      const query = CardQueryVO.create({ query: 'fix auth' });
      expect(query.matchesCardName('Fix bug')).toBe(false);
    });

    it('should be case insensitive', () => {
      const query = CardQueryVO.create({ query: 'FIX AUTH' });
      expect(query.matchesCardName('fix authentication')).toBe(true);
    });

    it('should handle single term queries', () => {
      const query = CardQueryVO.create({ query: 'auth' });
      expect(query.matchesCardName('Authentication failure')).toBe(true);
    });

    it('should handle short query terms (substrings)', () => {
      const query = CardQueryVO.create({ query: 'auth' });
      expect(query.matchesCardName('AuthenticationService')).toBe(true);
    });

    it('should match one-character queries against the card name', () => {
      const query = CardQueryVO.create({ query: 'a' });
      expect(query.matchesCardName('AuthenticationService')).toBe(true);
    });

    it('should return false when a one-character query is absent', () => {
      const query = CardQueryVO.create({ query: 'z' });
      expect(query.matchesCardName('AuthenticationService')).toBe(false);
    });
  });

  describe('escapeForRegex', () => {
    it('should escape special regex characters', () => {
      const query = CardQueryVO.create({ query: 'fix.*bug' });
      expect(query.escapeForRegex()).toBe('fix\\.\\*bug');
    });

    it('should escape parentheses', () => {
      const query = CardQueryVO.create({ query: 'test (foo)' });
      expect(query.escapeForRegex()).toBe('test \\(foo\\)');
    });
  });

  describe('validation', () => {
    it('should throw for empty query', () => {
      expect(() => CardQueryVO.create({ query: '' })).toThrow();
    });

    it('should throw for whitespace-only query', () => {
      expect(() => CardQueryVO.create({ query: '   ' })).toThrow();
    });

    it('should throw for limit exceeding max', () => {
      expect(() => CardQueryVO.create({ query: 'test', limit: 100 })).toThrow();
    });

    it('should throw for limit less than min', () => {
      expect(() => CardQueryVO.create({ query: 'test', limit: 0 })).toThrow();
    });
  });
});
