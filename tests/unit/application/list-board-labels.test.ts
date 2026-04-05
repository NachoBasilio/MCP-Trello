import { describe, expect, it } from 'vitest';

import { createListBoardLabelsUseCase } from '../../../src/application/list-board-labels.js';
import { createBoardNotFoundError } from '../../../src/domain/index.js';
import { err, ok } from '../../../src/shared/index.js';

/**
 * Protege el caso de uso que lista labels asegurando el conteo y propagacion de errores.
 */
describe('Caso de uso ListBoardLabels', () => {
  /**
   * Verifica que resuelva el board, obtenga labels y exponga el conteo real.
   */
  it('debe devolver boardId y labels resueltas', async () => {
    const useCase = createListBoardLabelsUseCase({
      resolveBoard: async () => ok('board-123'),
      listBoardLabels: async () =>
        ok([
          { id: 'label-1', name: 'Bug', color: 'red' },
          { id: 'label-2', name: 'Docs', color: 'blue' },
        ]),
      listBoards: async () => ok([]),
      listLabelCards: async () => ok([]),
      updateLabel: async () => {
        throw new Error('No deberia actualizar labels');
      },
    });

    const result = await useCase.execute({ boardName: 'Dev board' });

    expect(result).toEqual(
      ok({
        boardId: 'board-123',
        labelCount: 2,
        labels: [
          { id: 'label-1', name: 'Bug', color: 'red' },
          { id: 'label-2', name: 'Docs', color: 'blue' },
        ],
      })
    );
  });

  /**
   * Confirma que propaga errores de resolucion de board sin intentar listar labels.
   */
  it('debe propagar el error cuando no logra resolver el board', async () => {
    const boardError = createBoardNotFoundError();
    const useCase = createListBoardLabelsUseCase({
      resolveBoard: async () => err(boardError),
      listBoardLabels: async () => {
        throw new Error('No deberia listar labels');
      },
      listBoards: async () => ok([]),
      listLabelCards: async () => ok([]),
      updateLabel: async () => {
        throw new Error('No deberia actualizar labels');
      },
    });

    const result = await useCase.execute({ boardId: 'board-missing' });

    expect(result).toEqual(err(boardError));
  });
});
