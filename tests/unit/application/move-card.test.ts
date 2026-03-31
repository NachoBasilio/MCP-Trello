import { describe, expect, it, vi } from 'vitest';

import { createMoveCardUseCase } from '../../../src/application/move-card.js';
import type { CardSummary, List, Card } from '../../../src/domain/index.js';
import { ErrorCode } from '../../../src/domain/index.js';
import { ok, err } from '../../../src/shared/index.js';

const mockCards: CardSummary[] = [
  {
    id: 'card-1',
    name: 'Fix login bug',
    idList: 'list-1',
    listName: 'To Do',
    boardId: 'board-1',
    closed: false,
    shortUrl: 'https://trello.com/c/card-1',
    due: null,
  },
  {
    id: 'card-2',
    name: 'Login timeout issue',
    idList: 'list-1',
    listName: 'To Do',
    boardId: 'board-1',
    closed: false,
    shortUrl: 'https://trello.com/c/card-2',
    due: null,
  },
];

const mockLists: List[] = [
  { id: 'list-1', name: 'To Do', boardId: 'board-1' },
  { id: 'list-2', name: 'Done', boardId: 'board-1' },
];

const mockUpdatedCard: Card = {
  id: 'card-1',
  name: 'Fix login bug',
  listId: 'list-2',
  boardId: 'board-1',
  description: '',
  due: null,
  dueComplete: false,
  closed: false,
  labels: [],
  url: 'https://trello.com/c/card-1',
  pos: '1',
};

/**
 * Protege el caso de uso de mover tarjetas, incluyendo desambiguacion por nombre.
 */
describe('Caso de uso MoveCard', () => {
  /**
   * Verifica que usa cardId directamente cuando se provee, sin buscar por nombre.
   */
  it('debe mover la tarjeta por cardId sin buscar por nombre', async () => {
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listBoardLists = vi.fn(async () => ok(mockLists));
    const updateCard = vi.fn(async () => ok(mockUpdatedCard));
    const gateway = { resolveBoard, listBoardLists, updateCard };

    const useCase = createMoveCardUseCase(gateway as any);
    const result = await useCase.execute({ cardId: 'card-1', toList: 'Done' });

    expect(result).toEqual(ok(mockUpdatedCard));
    expect(updateCard).toHaveBeenCalledWith('card-1', { idList: 'list-2' });
  });

  /**
   * Verifica que resuelve por nombre cuando no se provee cardId.
   */
  it('debe mover la tarjeta por nombre exacto', async () => {
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listCards = vi.fn(async () => ok(mockCards));
    const listBoardLists = vi.fn(async () => ok(mockLists));
    const updateCard = vi.fn(async () => ok(mockUpdatedCard));
    const gateway = { resolveBoard, listCards, listBoardLists, updateCard };

    const useCase = createMoveCardUseCase(gateway as any);
    const result = await useCase.execute({ cardName: 'Fix login bug', toList: 'Done' });

    expect(result).toEqual(ok(mockUpdatedCard));
    expect(updateCard).toHaveBeenCalledWith('card-1', { idList: 'list-2' });
  });

  /**
   * Confirma que devuelve CARD_AMBIGUOSO cuando hay multiples matches.
   */
  it('debe devolver error ambiguo cuando cardName coincide con multiples tarjetas', async () => {
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listCards = vi.fn(async () => ok(mockCards));
    const updateCard = vi.fn();
    const gateway = { resolveBoard, listCards, updateCard };

    const useCase = createMoveCardUseCase(gateway as any);
    const result = await useCase.execute({ cardName: 'login', toList: 'Done' });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Se esperaba un error ambiguo');
    }

    expect(result.error.code).toBe(ErrorCode.CardAmbiguous);
    expect(updateCard).not.toHaveBeenCalled();
  });

  /**
   * Confirma que devuelve CARD_NOT_FOUND cuando no hay matches.
   */
  it('debe devolver error cuando cardName no coincide con ninguna tarjeta', async () => {
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listCards = vi.fn(async () => ok(mockCards));
    const updateCard = vi.fn();
    const gateway = { resolveBoard, listCards, updateCard };

    const useCase = createMoveCardUseCase(gateway as any);
    const result = await useCase.execute({ cardName: 'nonexistent card', toList: 'Done' });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Se esperaba un error de no encontrada');
    }

    expect(result.error.code).toBe(ErrorCode.CardNotFound);
    expect(updateCard).not.toHaveBeenCalled();
  });

  /**
   * Verifica que crea implicitamente la lista destino cuando no existe.
   */
  it('debe crear la lista implicitamente cuando no existe en el board', async () => {
    const newList: List = { id: 'list-new', name: 'Someday', boardId: 'board-1' };
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listCards = vi.fn(async () => ok(mockCards));
    const listBoardLists = vi.fn(async () => ok(mockLists));
    const createListFn = vi.fn(async () => ok(newList));
    const updateCard = vi.fn(async () => ok({ ...mockUpdatedCard, listId: 'list-new' }));
    const gateway = { resolveBoard, listCards, listBoardLists, createList: createListFn, updateCard };

    const useCase = createMoveCardUseCase(gateway as any);
    const result = await useCase.execute({ cardName: 'Fix login bug', toList: 'Someday' });

    expect(result.ok).toBe(true);
    expect(createListFn).toHaveBeenCalledWith('board-1', 'Someday');
    expect(updateCard).toHaveBeenCalledWith('card-1', { idList: 'list-new' });
  });
});
