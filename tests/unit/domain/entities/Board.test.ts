import { describe, it, expect } from 'vitest';
import { Board, BoardSchema, createBoard } from '@entities/Board.js';

describe('Board Entity', () => {
  describe('BoardSchema', () => {
    it('should parse a valid board', () => {
      const board = {
        id: 'board123',
        name: 'My Board',
        description: 'A test board',
        url: 'https://trello.com/b/board123',
        closed: false,
      };

      const result = BoardSchema.safeParse(board);
      expect(result.success).toBe(true);
    });

    it('should accept board without optional fields', () => {
      const board = {
        id: 'board123',
        name: 'My Board',
      };

      const result = BoardSchema.safeParse(board);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('');
        expect(result.data.closed).toBe(false);
      }
    });

    it('should reject board without id', () => {
      const board = {
        name: 'My Board',
      };

      const result = BoardSchema.safeParse(board);
      expect(result.success).toBe(false);
    });
  });

  describe('createBoard factory', () => {
    it('should create a board with all fields', () => {
      const board = createBoard({
        id: 'board123',
        name: 'My Board',
        description: 'Description',
        url: 'https://trello.com/b/board123',
        closed: false,
      });

      expect(board.id).toBe('board123');
      expect(board.name).toBe('My Board');
      expect(board.description).toBe('Description');
      expect(board.url).toBe('https://trello.com/b/board123');
      expect(board.closed).toBe(false);
    });
  });
});
