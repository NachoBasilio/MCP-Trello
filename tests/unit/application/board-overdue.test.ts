import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { createBoardOverdueUseCase } from '../../../src/application/board-overdue.js';
import type { CardSummary } from '../../../src/domain/index.js';
import { ErrorCode } from '../../../src/domain/index.js';
import { ok, err } from '../../../src/shared/index.js';

const now = new Date('2026-03-31T12:00:00.000Z');

const overdueCard: CardSummary = {
  id: 'card-1',
  name: 'Tarjeta vencida',
  idList: 'list-1',
  listName: 'To Do',
  boardId: 'board-1',
  closed: false,
  shortUrl: 'https://trello.com/c/card-1',
  due: '2026-03-20T00:00:00.000Z',
};

const futureCard: CardSummary = {
  id: 'card-2',
  name: 'Tarjeta futura',
  idList: 'list-1',
  listName: 'To Do',
  boardId: 'board-1',
  closed: false,
  shortUrl: 'https://trello.com/c/card-2',
  due: '2026-04-15T00:00:00.000Z',
};

const closedCard: CardSummary = {
  id: 'card-3',
  name: 'Tarjeta cerrada vencida',
  idList: 'list-1',
  listName: 'Done',
  boardId: 'board-1',
  closed: true,
  shortUrl: 'https://trello.com/c/card-3',
  due: '2026-03-01T00:00:00.000Z',
};

const noDueCard: CardSummary = {
  id: 'card-4',
  name: 'Sin fecha',
  idList: 'list-1',
  listName: 'To Do',
  boardId: 'board-1',
  closed: false,
  shortUrl: 'https://trello.com/c/card-4',
  due: null,
};

/**
 * Protege el filtrado de tarjetas vencidas y el conteo correcto.
 */
describe('Caso de uso BoardOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Verifica que filtra solo tarjetas con fecha pasada y no cerradas.
   */
  it('debe devolver solo tarjetas vencidas y no cerradas', async () => {
    const cards = [overdueCard, futureCard, closedCard, noDueCard];
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listCards = vi.fn(async () => ok(cards));
    const gateway = { resolveBoard, listCards };

    const useCase = createBoardOverdueUseCase(gateway as any);
    const result = await useCase.execute({ boardId: 'board-1' });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Se esperaba un resultado exitoso');
    }

    expect(result.value.boardId).toBe('board-1');
    expect(result.value.overdueCards).toHaveLength(1);
    expect(result.value.overdueCards[0].id).toBe('card-1');
    expect(result.value.overdueCount).toBe(1);
  });

  /**
   * Verifica que devuelve vacio cuando no hay tarjetas vencidas.
   */
  it('debe devolver array vacio cuando no hay tarjetas vencidas', async () => {
    const cards = [futureCard, noDueCard];
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listCards = vi.fn(async () => ok(cards));
    const gateway = { resolveBoard, listCards };

    const useCase = createBoardOverdueUseCase(gateway as any);
    const result = await useCase.execute({ boardId: 'board-1' });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Se esperaba un resultado exitoso');
    }

    expect(result.value.overdueCards).toHaveLength(0);
    expect(result.value.overdueCount).toBe(0);
  });

  /**
   * Confirma que propaga errores de resolveBoard.
   */
  it('debe propagar error cuando resolveBoard falla', async () => {
    const resolveBoard = vi.fn(async () => err({ code: ErrorCode.BoardNotFound, message: 'Not found' }));
    const gateway = { resolveBoard };

    const useCase = createBoardOverdueUseCase(gateway as any);
    const result = await useCase.execute({ boardId: 'board-missing' });

    expect(result.ok).toBe(false);
  });

  /**
   * Confirma que ignora tarjetas cerradas aunque tengan fecha vencida.
   */
  it('debe excluir tarjetas cerradas del resultado', async () => {
    const cards = [closedCard];
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listCards = vi.fn(async () => ok(cards));
    const gateway = { resolveBoard, listCards };

    const useCase = createBoardOverdueUseCase(gateway as any);
    const result = await useCase.execute({ boardId: 'board-1' });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('Se esperaba un resultado exitoso');
    }

    expect(result.value.overdueCards).toHaveLength(0);
  });
});
