import { describe, expect, it } from 'vitest';

import {
  trelloListLabelCardsInputSchema,
  trelloSearchCardsByLabelInputSchema,
  trelloUpdateLabelInputSchema,
} from '../../../../src/types/tool-contract.js';

/**
 * Protege las validaciones de entrada de las nuevas tools de labels.
 */
describe('Schemas MCP de labels', () => {
  /**
   * Debe requerir labelId/labelName y board cuando se usa labelName.
   */
  it('trello_list_label_cards valida label y contexto de board', () => {
    const missingLabel = trelloListLabelCardsInputSchema.safeParse({ boardId: 'board-1' });
    expect(missingLabel.success).toBe(false);

    const missingBoard = trelloListLabelCardsInputSchema.safeParse({ labelName: 'Bug' });
    expect(missingBoard.success).toBe(false);

    const valid = trelloListLabelCardsInputSchema.safeParse({ labelId: 'label-1', boardId: 'board-1' });
    expect(valid.success).toBe(true);
  });

  /**
   * Debe restringir limit a un maximo de 25 para la tool de busqueda.
   */
  it('trello_search_cards_by_label forza limit <= 25', () => {
    const tooLarge = trelloSearchCardsByLabelInputSchema.safeParse({
      labelId: 'label-1',
      boardId: 'board-1',
      query: 'bug',
      limit: 50,
    });
    expect(tooLarge.success).toBe(false);

    const valid = trelloSearchCardsByLabelInputSchema.safeParse({
      labelId: 'label-1',
      boardId: 'board-1',
      query: 'bug',
      limit: 10,
    });
    expect(valid.success).toBe(true);
  });

  /**
   * Debe exigir newName o newColor en la tool de update.
   */
  it('trello_update_label requiere campos de actualizacion', () => {
    const missingUpdates = trelloUpdateLabelInputSchema.safeParse({
      labelId: 'label-1',
      boardId: 'board-1',
    });
    expect(missingUpdates.success).toBe(false);

    const invalidColor = trelloUpdateLabelInputSchema.safeParse({
      labelId: 'label-1',
      boardId: 'board-1',
      newColor: 'turquoise',
    });
    expect(invalidColor.success).toBe(false);

    const valid = trelloUpdateLabelInputSchema.safeParse({
      labelId: 'label-1',
      boardId: 'board-1',
      newColor: 'red',
    });
    expect(valid.success).toBe(true);
  });
});
