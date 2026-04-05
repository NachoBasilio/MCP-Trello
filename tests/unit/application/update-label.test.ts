import { describe, expect, it, vi } from 'vitest';

import { createUpdateLabelUseCase } from '../../../src/application/update-label.js';
import type { ResolveLabelUseCase } from '../../../src/application/resolve-label.js';
import { createValidationError } from '../../../src/domain/index.js';
import { ok } from '../../../src/shared/index.js';

/**
 * Protege el caso de uso de update-label para validar entradas y normalizar valores.
 */
describe('Caso de uso UpdateLabel', () => {
  /**
   * Debe normalizar nombre y color, y delegar al puerto updateLabel.
   */
  it('debe actualizar label con nombre y color normalizados', async () => {
    const resolveLabel: ResolveLabelUseCase = {
      execute: vi.fn(async () =>
        ok({
          boardId: 'board-1',
          label: { id: 'label-1', name: 'Bug', color: 'red' },
        })
      ),
    };
    const updateLabel = vi
      .fn()
      .mockResolvedValue(ok({ id: 'label-1', name: 'Critical bugs', color: 'green' }));
    const useCase = createUpdateLabelUseCase(
      {
        resolveBoard: async () => ok('board-1'),
        listBoardLabels: async () => ok([]),
        listBoards: async () => ok([]),
        listLabelCards: async () => ok([]),
        updateLabel,
      },
      resolveLabel
    );

    const result = await useCase.execute({
      labelName: 'bug',
      boardId: 'board-1',
      newName: '  Critical Bugs  ',
      newColor: 'GREEN',
    });

    expect(updateLabel).toHaveBeenCalledWith('label-1', {
      name: 'Critical Bugs',
      color: 'green',
    });
    expect(result).toEqual(
      ok({
        label: { id: 'label-1', name: 'Critical bugs', color: 'green' },
      })
    );
  });

  /**
   * Debe fallar cuando no se provee newName ni newColor.
   */
  it('debe devolver error de validacion cuando no hay campos para actualizar', async () => {
    const resolveLabel: ResolveLabelUseCase = {
      execute: vi.fn(async () =>
        ok({
          boardId: 'board-1',
          label: { id: 'label-1', name: 'Bug', color: 'red' },
        })
      ),
    };
    const useCase = createUpdateLabelUseCase(
      {
        resolveBoard: async () => ok('board-1'),
        listBoardLabels: async () => ok([]),
        listBoards: async () => ok([]),
        listLabelCards: async () => ok([]),
        updateLabel: async () => ok({ id: 'label-1', name: 'Bug', color: 'red' }),
      },
      resolveLabel
    );

    const result = await useCase.execute({ labelId: 'label-1', boardId: 'board-1' });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Se esperaba resultado fallido');
    }
    expect(result.error.message).toBe('newName or newColor is required');
  });
});
