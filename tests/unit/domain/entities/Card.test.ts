import { describe, it, expect } from 'vitest';
import { Card, CardSchema, createCard } from '../../../../src/domain/entities/Card.js';
import { createLabel } from '../../../../src/domain/entities/Label.js';

/**
 * Cubre el contrato estructural de tarjetas y los defaults aplicados por la fabrica.
 */
describe('Entidad Card', () => {
  /**
   * Verifica el schema de tarjetas, incluyendo campos opcionales y obligatorios.
   */
  describe('Esquema de cards', () => {
    it('debe parsear una tarjeta valida', () => {
      const card = {
        id: 'card123',
        name: 'Test Card',
        listId: 'list123',
        boardId: 'board123',
        url: 'https://trello.com/c/card123',
        description: 'A test card',
        due: '2024-12-31T23:59:59.000Z',
        dueComplete: false,
        labels: [],
        closed: false,
      };

      const result = CardSchema.safeParse(card);
      expect(result.success).toBe(true);
    });

    it('debe aceptar una tarjeta sin campos opcionales', () => {
      const card = {
        id: 'card123',
        name: 'Test Card',
        listId: 'list123',
        boardId: 'board123',
        url: 'https://trello.com/c/card123',
      };

      const result = CardSchema.safeParse(card);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('');
        expect(result.data.labels).toEqual([]);
        expect(result.data.closed).toBe(false);
      }
    });

    it('debe rechazar una tarjeta sin id', () => {
      const card = {
        name: 'Test Card',
        listId: 'list123',
        boardId: 'board123',
        url: 'https://trello.com/c/card123',
      };

      const result = CardSchema.safeParse(card);
      expect(result.success).toBe(false);
    });

    it('debe rechazar una tarjeta sin nombre', () => {
      const card = {
        id: 'card123',
        listId: 'list123',
        boardId: 'board123',
        url: 'https://trello.com/c/card123',
      };

      const result = CardSchema.safeParse(card);
      expect(result.success).toBe(false);
    });
  });

  /**
   * Confirma que la fabrica complete tanto datos provistos como valores por defecto.
   */
  describe('Fabrica de cards', () => {
    it('debe crear una tarjeta con todos sus campos', () => {
      const card = createCard({
        id: 'card123',
        name: 'Test Card',
        listId: 'list123',
        boardId: 'board123',
        url: 'https://trello.com/c/card123',
        description: 'Description',
        due: '2024-12-31T23:59:59.000Z',
        dueComplete: true,
        labels: [createLabel({ id: 'label1', name: 'bug', color: 'red' })],
        closed: false,
      });

      expect(card.id).toBe('card123');
      expect(card.name).toBe('Test Card');
      expect(card.listId).toBe('list123');
      expect(card.boardId).toBe('board123');
      expect(card.url).toBe('https://trello.com/c/card123');
      expect(card.description).toBe('Description');
      expect(card.due).toBe('2024-12-31T23:59:59.000Z');
      expect(card.dueComplete).toBe(true);
      expect(card.labels).toHaveLength(1);
      expect(card.closed).toBe(false);
    });

    it('debe crear una tarjeta con valores opcionales por defecto', () => {
      const card = createCard({
        id: 'card123',
        name: 'Test Card',
        listId: 'list123',
        boardId: 'board123',
        url: 'https://trello.com/c/card123',
      });

      expect(card.description).toBe('');
      expect(card.dueComplete).toBe(false);
      expect(card.labels).toEqual([]);
      expect(card.closed).toBe(false);
    });
  });
});
