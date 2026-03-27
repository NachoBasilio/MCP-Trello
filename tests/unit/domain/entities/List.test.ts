import { describe, it, expect } from 'vitest';
import { List, ListSchema, createList } from '@entities/List.js';

describe('List Entity', () => {
  describe('ListSchema', () => {
    it('should parse a valid list', () => {
      const list = {
        id: 'list123',
        name: 'To Do',
        boardId: 'board123',
      };

      const result = ListSchema.safeParse(list);
      expect(result.success).toBe(true);
    });

    it('should reject list without id', () => {
      const list = {
        name: 'To Do',
        boardId: 'board123',
      };

      const result = ListSchema.safeParse(list);
      expect(result.success).toBe(false);
    });

    it('should reject list without name', () => {
      const list = {
        id: 'list123',
        boardId: 'board123',
      };

      const result = ListSchema.safeParse(list);
      expect(result.success).toBe(false);
    });
  });

  describe('createList factory', () => {
    it('should create a list with all fields', () => {
      const list = createList({
        id: 'list123',
        name: 'In Progress',
        boardId: 'board123',
      });

      expect(list.id).toBe('list123');
      expect(list.name).toBe('In Progress');
      expect(list.boardId).toBe('board123');
    });
  });
});
