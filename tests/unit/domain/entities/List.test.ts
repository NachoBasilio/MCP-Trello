import { describe, it, expect } from 'vitest';
import { ListSchema, createList } from '../../../../src/domain/entities/List.js';

/**
 * Cubre la validacion estructural de listas y la fabrica del agregado de dominio.
 */
describe('Entidad List', () => {
  /**
   * Verifica el schema de listas con sus campos obligatorios.
   */
  describe('Esquema de listas', () => {
    it('debe parsear una lista valida', () => {
      const list = {
        id: 'list123',
        name: 'To Do',
        boardId: 'board123',
      };

      const result = ListSchema.safeParse(list);
      expect(result.success).toBe(true);
    });

    it('debe rechazar una lista sin id', () => {
      const list = {
        name: 'To Do',
        boardId: 'board123',
      };

      const result = ListSchema.safeParse(list);
      expect(result.success).toBe(false);
    });

    it('debe rechazar una lista sin nombre', () => {
      const list = {
        id: 'list123',
        boardId: 'board123',
      };

      const result = ListSchema.safeParse(list);
      expect(result.success).toBe(false);
    });
  });

  /**
   * Confirma que la fabrica mantenga id, nombre y boardId sin alteraciones.
   */
  describe('Fabrica de listas', () => {
    it('debe crear una lista con todos sus campos', () => {
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
