import { describe, expect, it, vi } from 'vitest';

import { createSearchCardsByLabelUseCase } from '../../../src/application/search-cards-by-label.js';
import type { ListLabelCardsUseCase } from '../../../src/application/list-label-cards.js';
import { ok } from '../../../src/shared/index.js';

/**
 * Protege el filtrado de tarjetas dentro de un label usando CardQueryVO.
 */
describe('Caso de uso SearchCardsByLabel', () => {
  /**
   * Debe filtrar por terminos AND y marcar truncado por limite propio o del origen.
   */
  it('debe devolver solo las tarjetas que matchean la query y propagar truncado acumulado', async () => {
    const baseUseCase: ListLabelCardsUseCase = {
      execute: vi.fn(async () =>
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
            {
              id: 'card-2',
              name: 'Investigate signup bug',
              idList: 'list-1',
              listName: 'To Do',
              boardId: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-2',
              due: null,
            },
          ],
          cardCount: 2,
          truncated: true,
        })
      ),
    };
    const useCase = createSearchCardsByLabelUseCase(baseUseCase);

    const result = await useCase.execute({ labelId: 'label-1', boardId: 'board-1', query: 'signup', limit: 1 });

    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        label: { id: 'label-1', name: 'Bug', color: 'red' },
        cards: [
          {
            id: 'card-2',
            name: 'Investigate signup bug',
            idList: 'list-1',
            listName: 'To Do',
            boardId: 'board-1',
            closed: false,
            shortUrl: 'https://trello.com/c/card-2',
            due: null,
          },
        ],
        cardCount: 1,
        truncated: true,
        query: 'signup',
      })
    );
  });
});
