import { describe, expect, it, vi } from 'vitest';

import { createListColumnsUseCase } from '../../../src/application/list-columns.js';
import { ok } from '../../../src/shared/index.js';

/**
 * Protege el caso de uso que lista columnas y devuelve IDs para operar sin ambiguedad.
 */
describe('Caso de uso ListColumns', () => {
  /**
   * Verifica que resuelva el board y pida listas incluyendo cerradas para devolver todas las columnas.
   */
  it('debe listar todas las columnas usando includeClosed=true', async () => {
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listBoardLists = vi.fn(async () =>
      ok([
        { id: 'list-1', name: 'To Do', boardId: 'board-1' },
        { id: 'list-2', name: 'Done', boardId: 'board-1' },
      ])
    );
    const gateway = { resolveBoard, listBoardLists };

    const useCase = createListColumnsUseCase(gateway as any);
    const result = await useCase.execute({ boardName: 'Proyecto' });

    expect(result).toEqual(
      ok({
        boardId: 'board-1',
        columns: [
          { id: 'list-1', name: 'To Do', boardId: 'board-1' },
          { id: 'list-2', name: 'Done', boardId: 'board-1' },
        ],
      })
    );
    expect(resolveBoard).toHaveBeenCalledWith({ boardId: undefined, boardName: 'Proyecto' });
    expect(listBoardLists).toHaveBeenCalledWith('board-1', { includeClosed: true });
  });
});
