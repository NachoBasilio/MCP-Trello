import { describe, it, expect } from 'vitest';
import { ListNameVO } from '../../../../src/domain/value-objects/ListName.js';

describe('ListNameVO', () => {
  describe('create', () => {
    it('should create a ListNameVO', () => {
      const name = ListNameVO.create('In Progress');
      expect(name.value).toBe('In Progress');
    });

    it('should trim leading and trailing whitespace', () => {
      const name = ListNameVO.create('  To Do  ');
      expect(name.value).toBe('To Do');
    });
  });

  describe('equals', () => {
    it('should return true for identical names', () => {
      const name1 = ListNameVO.create('In Progress');
      const name2 = ListNameVO.create('In Progress');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return true for case-insensitive match', () => {
      const name1 = ListNameVO.create('In Progress');
      const name2 = ListNameVO.create('in progress');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different names', () => {
      const name1 = ListNameVO.create('In Progress');
      const name2 = ListNameVO.create('Done');
      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('matches', () => {
    it('should return true for case-insensitive match', () => {
      const name = ListNameVO.create('In Progress');
      expect(name.matches('in progress')).toBe(true);
    });

    it('should return false for different names', () => {
      const name = ListNameVO.create('In Progress');
      expect(name.matches('Done')).toBe(false);
    });
  });

  describe('validation', () => {
    it('should throw for empty name', () => {
      expect(() => ListNameVO.create('')).toThrow();
    });

    it('should throw for whitespace-only name', () => {
      expect(() => ListNameVO.create('   ')).toThrow();
    });

    it('should throw for name exceeding max length', () => {
      const longName = 'a'.repeat(513);
      expect(() => ListNameVO.create(longName)).toThrow();
    });
  });
});
