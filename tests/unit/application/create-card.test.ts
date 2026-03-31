import { describe, expect, it, vi } from 'vitest';

import { createCreateCardUseCase } from '../../../src/application/create-card.js';
import type { Card, List } from '../../../src/domain/index.js';
import { ErrorCode } from '../../../src/domain/index.js';
import { ok, err } from '../../../src/shared/index.js';

const mockCard: Card = {
  id: 'card-1',
  name: 'Nueva tarjeta',
  listId: 'list-1',
  boardId: 'board-1',
  description: '',
  due: null,
  dueComplete: false,
  closed: false,
  labels: [],
  url: 'https://trello.com/c/card-1',
  pos: '1',
};

const mockList: List = { id: 'list-1', name: 'To Do', boardId: 'board-1' };

/**
 * Protege el caso de uso de creacion de tarjetas, incluyendo la creacion implicita de listas.
 */
describe('Caso de uso CreateCard', () => {
  /**
   * Verifica que crea una tarjeta en una lista existente.
   */
  it('debe crear una tarjeta en una lista que ya existe', async () => {
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listBoardLists = vi.fn(async () => ok([mockList]));
    const createCard = vi.fn(async () => ok(mockCard));
    const gateway = { resolveBoard, listBoardLists, createCard };

    const useCase = createCreateCardUseCase(gateway as any);
    const result = await useCase.execute({ name: 'Nueva tarjeta', listName: 'To Do' });

    expect(result).toEqual(ok(mockCard));
    expect(createCard).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nueva tarjeta', idList: 'list-1' })
    );
    expect(listBoardLists).toHaveBeenCalledWith('board-1');
  });

  /**
   * Verifica que crea implicitamente una lista cuando no existe.
   */
  it('debe crear la lista implicitamente cuando no existe', async () => {
    const newList: List = { id: 'list-new', name: 'Backlog', boardId: 'board-1' };
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listBoardLists = vi.fn(async () => ok([mockList]));
    const createListFn = vi.fn(async () => ok(newList));
    const createCardFn = vi.fn(async () => ok({ ...mockCard, idList: 'list-new' }));

    const gateway = {
      resolveBoard,
      listBoardLists,
      createList: createListFn,
      createCard: createCardFn,
    };

    const useCase = createCreateCardUseCase(gateway as any);
    const result = await useCase.execute({ name: 'Tarjeta nueva', listName: 'Backlog' });

    expect(result.ok).toBe(true);
    expect(createListFn).toHaveBeenCalledWith('board-1', 'Backlog');
    expect(createCardFn).toHaveBeenCalledWith(
      expect.objectContaining({ idList: 'list-new' })
    );
  });

  /**
   * Verifica que el default de lista es "To Do" cuando no se provee listName.
   */
  it('debe usar "To Do" como lista por defecto', async () => {
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listBoardLists = vi.fn(async () => ok([mockList]));
    const createCardFn = vi.fn(async () => ok(mockCard));
    const gateway = { resolveBoard, listBoardLists, createCard: createCardFn };

    const useCase = createCreateCardUseCase(gateway as any);
    await useCase.execute({ name: 'Sin lista' });

    expect(listBoardLists).toHaveBeenCalledWith('board-1');
    expect(createCardFn).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Sin lista' })
    );
  });

  /**
   * Confirma que propaga el error de board cuando resolveBoard falla.
   */
  it('debe propagar el error cuando resolveBoard falla', async () => {
    const boardError = err({ code: ErrorCode.BoardIdRequired, message: 'Board ID required' });
    const resolveBoard = vi.fn(async () => boardError);
    const gateway = { resolveBoard };

    const useCase = createCreateCardUseCase(gateway as any);
    const result = await useCase.execute({ name: 'Tarjeta' });

    expect(result.ok).toBe(false);
  });
});
