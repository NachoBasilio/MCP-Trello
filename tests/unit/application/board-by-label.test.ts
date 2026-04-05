import { describe, expect, it, vi } from 'vitest';

import { createBoardByLabelUseCase } from '../../../src/application/board-by-label.js';
import type { ListLabelCardsUseCase } from '../../../src/application/list-label-cards.js';
import { ok } from '../../../src/shared/index.js';

/**
 * Protege el wrapper de BoardByLabel ahora que delega en ListLabelCards.
 */
describe('Caso de uso BoardByLabel', () => {
  /**
   * Debe delegar en ListLabelCards pasando boardName y limit.
   */
  it('debe delegar en ListLabelCards con los parametros esperados', async () => {
    const listLabelCards: ListLabelCardsUseCase = {
      execute: vi.fn(async () =>
        ok({
          boardId: 'board-1',
          label: { id: 'label-1', name: 'Bug', color: 'red' },
          cards: [],
          cardCount: 0,
          truncated: false,
        })
      ),
    };
    const useCase = createBoardByLabelUseCase(listLabelCards);

    const result = await useCase.execute({ boardName: 'Dev Board', labelName: 'bug', limit: 25 });

    expect(listLabelCards.execute).toHaveBeenCalledWith({
      boardName: 'Dev Board',
      labelName: 'bug',
      limit: 25,
    });
    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        label: { id: 'label-1', name: 'Bug', color: 'red' },
        cards: [],
        cardCount: 0,
        truncated: false,
      })
    );
  });
});
