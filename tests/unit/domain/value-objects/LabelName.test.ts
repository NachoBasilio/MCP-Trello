import { describe, it, expect } from 'vitest';
import { LabelNameVO } from '../../../../src/domain/value-objects/LabelName.js';

describe('LabelNameVO', () => {
  describe('create', () => {
    it('should create a LabelNameVO', () => {
      const name = LabelNameVO.create('bug');
      expect(name.value).toBe('bug');
    });

    it('should trim leading and trailing whitespace', () => {
      const name = LabelNameVO.create('  urgent  ');
      expect(name.value).toBe('urgent');
    });
  });

  describe('equals', () => {
    it('should return true for identical names', () => {
      const name1 = LabelNameVO.create('bug');
      const name2 = LabelNameVO.create('bug');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return true for case-insensitive match', () => {
      const name1 = LabelNameVO.create('BUG');
      const name2 = LabelNameVO.create('bug');
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different names', () => {
      const name1 = LabelNameVO.create('bug');
      const name2 = LabelNameVO.create('feature');
      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('matches', () => {
    it('should return true for case-insensitive match', () => {
      const name = LabelNameVO.create('bug');
      expect(name.matches('BUG')).toBe(true);
    });

    it('should return false for different names', () => {
      const name = LabelNameVO.create('bug');
      expect(name.matches('feature')).toBe(false);
    });
  });

  describe('validation', () => {
    it('should throw for empty name', () => {
      expect(() => LabelNameVO.create('')).toThrow();
    });

    it('should throw for whitespace-only name', () => {
      expect(() => LabelNameVO.create('   ')).toThrow();
    });

    it('should throw for name exceeding max length', () => {
      const longName = 'a'.repeat(513);
      expect(() => LabelNameVO.create(longName)).toThrow();
    });
  });
});
