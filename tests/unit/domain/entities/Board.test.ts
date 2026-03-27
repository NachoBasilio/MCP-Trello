import { describe, it, expect } from 'vitest';
import { BoardSchema, createBoard } from '../../../../src/domain/entities/Board.js';

/**
 * Cubre el contrato estructural de boards y la fabrica que aplica defaults.
 */
describe('Entidad Board', () => {
  /**
   * Verifica el schema de boards con campos requeridos y opcionales.
   */
  describe('Esquema de boards', () => {
    it('debe parsear un board valido', () => {
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

    it('debe aceptar un board sin campos opcionales', () => {
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

    it('debe rechazar un board sin id', () => {
      const board = {
        name: 'My Board',
      };

      const result = BoardSchema.safeParse(board);
      expect(result.success).toBe(false);
    });
  });

  /**
   * Confirma que la fabrica de boards preserve todos los datos recibidos.
   */
  describe('Fabrica de boards', () => {
    it('debe crear un board con todos sus campos', () => {
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
