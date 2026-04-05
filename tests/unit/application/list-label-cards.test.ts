import { describe, expect, it, vi } from 'vitest';

import { createListLabelCardsUseCase } from '../../../src/application/list-label-cards.js';
import type { ResolveLabelUseCase } from '../../../src/application/resolve-label.js';
import { createNotFoundError } from '../../../src/domain/index.js';
import { err, ok } from '../../../src/shared/index.js';

/**
 * Protege el caso de uso que lista tarjetas por label reutilizando ResolveLabel.
 */
describe('Caso de uso ListLabelCards', () => {
  /**
   * Debe truncar usando limit+1 y devolver metadata completa.
   */
  it('debe respetar el limite y marcar truncado cuando hay mas tarjetas', async () => {
    const resolveLabel: ResolveLabelUseCase = {
      execute: vi.fn(async () =>
        ok({
          boardId: 'board-1',
          label: { id: 'label-1', name: 'Bug', color: 'red' },
        })
      ),
    };
    const listLabelCardsPort = {
      listLabelCards: vi.fn(async () =>
        ok([
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
            name: 'Fix signup bug',
            idList: 'list-1',
            listName: 'To Do',
            boardId: 'board-1',
            closed: false,
            shortUrl: 'https://trello.com/c/card-2',
            due: null,
          },
        ])
      ),
      resolveBoard: async () => ok('board-1'),
      listBoardLabels: async () => ok([]),
      listBoards: async () => ok([]),
      updateLabel: async () => ok({ id: 'label-1', name: 'Bug', color: 'red' }),
    };
    const useCase = createListLabelCardsUseCase(listLabelCardsPort, resolveLabel);

    const result = await useCase.execute({ boardId: 'board-1', labelName: 'Bug', limit: 1 });

    expect(listLabelCardsPort.listLabelCards).toHaveBeenCalledWith({
      boardId: 'board-1',
      labelId: 'label-1',
      limit: 2,
    });
    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        label: { id: 'label-1', name: 'Bug', color: 'red' },
        cards: [
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
        ],
        cardCount: 1,
        truncated: true,
      })
    );
  });

  /**
   * Propaga errores cuando la resolucion de label falla.
   */
  it('debe devolver el error cuando ResolveLabel falla', async () => {
    const labelError = createNotFoundError('label', 'Bug');
    const failingResolveLabel: ResolveLabelUseCase = {
      execute: vi.fn(async () => err(labelError)),
    };
    const useCase = createListLabelCardsUseCase(
      {
        listLabelCards: async () => {
          throw new Error('No deberia listar');
        },
        resolveBoard: async () => ok('board-1'),
        listBoardLabels: async () => ok([]),
        listBoards: async () => ok([]),
        updateLabel: async () => ok({ id: 'label-1', name: 'Bug', color: 'red' }),
      },
      failingResolveLabel
    );

    const result = await useCase.execute({ labelName: 'Bug' });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Se esperaba resultado fallido');
    }
    expect(result.error).toEqual(labelError);
  });
});
