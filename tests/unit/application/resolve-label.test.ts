import { describe, expect, it } from 'vitest';

import { createResolveLabelUseCase } from '../../../src/application/resolve-label.js';
import {
  createAmbiguousError,
  createNotFoundError,
  createValidationError,
} from '../../../src/domain/index.js';
import { err, ok } from '../../../src/shared/index.js';

/**
 * Protege la seleccion de labels por id o nombre y la deteccion de ambigüedad.
 */
describe('Caso de uso ResolveLabel', () => {
  /**
   * Verifica que pueda resolver por id directo sin revisar nombres.
   */
  it('debe resolver label por id explicito', async () => {
    const useCase = createResolveLabelUseCase({
      resolveBoard: async () => ok('board-1'),
      listBoardLabels: async () =>
        ok([
          { id: 'label-1', name: 'Bug', color: 'red' },
          { id: 'label-2', name: 'Docs', color: 'blue' },
        ]),
      listBoards: async () => ok([]),
      listLabelCards: async () => ok([]),
      updateLabel: async () => {
        throw new Error('No deberia actualizar');
      },
    });

    const result = await useCase.execute({ labelId: 'label-2', boardId: 'board-1' });

    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        label: { id: 'label-2', name: 'Docs', color: 'blue' },
      })
    );
  });

  /**
   * Confirma la resolucion case-insensitive por nombre con deteccion de ambigüedad.
   */
  it('debe propagar error de ambiguedad cuando hay multiples labels con el mismo nombre', async () => {
    const useCase = createResolveLabelUseCase({
      resolveBoard: async () => ok('board-2'),
      listBoardLabels: async () =>
        ok([
          { id: 'label-1', name: 'Bug', color: 'red' },
          { id: 'label-2', name: 'BUG', color: 'green' },
        ]),
      listBoards: async () => ok([]),
      listLabelCards: async () => ok([]),
      updateLabel: async () => {
        throw new Error('No deberia actualizar');
      },
    });

    const result = await useCase.execute({ labelName: 'bug', boardId: 'board-2' });

    expect(result).toEqual(
      err(
        createAmbiguousError(
          'label',
          [
            { id: 'label-1', name: 'Bug' },
            { id: 'label-2', name: 'BUG' },
          ],
          'bug'
        )
      )
    );
  });

  /**
   * Verifica que devuelva error de validacion cuando no se provee ningun selector.
   */
  it('debe fallar cuando no se provee labelId ni labelName', async () => {
    const useCase = createResolveLabelUseCase({
      resolveBoard: async () => ok('board-3'),
      listBoardLabels: async () => ok([]),
      listBoards: async () => ok([]),
      listLabelCards: async () => ok([]),
      updateLabel: async () => {
        throw new Error('No deberia actualizar');
      },
    });

    const result = await useCase.execute({ boardId: 'board-3' });

    expect(result).toEqual(err(createValidationError('labelId or labelName is required')));
  });

  /**
   * Verifica que al no encontrar label por nombre devuelva el error de dominio correcto.
   */
  it('debe devolver error not found cuando el nombre no existe', async () => {
    const useCase = createResolveLabelUseCase({
      resolveBoard: async () => ok('board-4'),
      listBoardLabels: async () => ok([{ id: 'label-1', name: 'Bug', color: 'red' }]),
      listBoards: async () => ok([]),
      listLabelCards: async () => ok([]),
      updateLabel: async () => {
        throw new Error('No deberia actualizar');
      },
    });

    const result = await useCase.execute({ labelName: 'Docs', boardId: 'board-4' });

    expect(result).toEqual(err(createNotFoundError('label', 'Docs')));
  });
});
