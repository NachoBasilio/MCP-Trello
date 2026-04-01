import { describe, expect, it, vi } from 'vitest';

import { createChangeLabelColorUseCase } from '../../../src/application/change-label-color.js';
import { ErrorCode, type Label } from '../../../src/domain/index.js';
import { ok } from '../../../src/shared/index.js';

/**
 * Protege el caso de uso que cambia colores de labels por ID o por nombre.
 */
describe('Caso de uso ChangeLabelColor', () => {
  /**
   * Verifica que con labelId no haga resolucion por board y actualice directo.
   */
  it('debe actualizar por labelId sin resolver board', async () => {
    const updatedLabel: Label = { id: 'label-1', name: 'bug', color: 'green' };
    const updateLabelColor = vi.fn(async () => ok(updatedLabel));
    const resolveBoard = vi.fn();
    const listBoardLabels = vi.fn();
    const gateway = { updateLabelColor, resolveBoard, listBoardLabels };

    const useCase = createChangeLabelColorUseCase(gateway as any);
    const result = await useCase.execute({ labelId: 'label-1', color: 'green' });

    expect(result).toEqual(ok(updatedLabel));
    expect(updateLabelColor).toHaveBeenCalledWith('label-1', 'green');
    expect(resolveBoard).not.toHaveBeenCalled();
    expect(listBoardLabels).not.toHaveBeenCalled();
  });

  /**
   * Verifica que cuando se busca por nombre resuelva board y label antes de actualizar.
   */
  it('debe resolver por labelName dentro de un board', async () => {
    const updateLabelColor = vi.fn(async () => ok({ id: 'label-2', name: 'backend', color: 'red' }));
    const resolveBoard = vi.fn(async () => ok('board-1'));
    const listBoardLabels = vi.fn(async () =>
      ok([
        { id: 'label-1', name: 'bug', color: 'yellow' },
        { id: 'label-2', name: 'backend', color: 'blue' },
      ])
    );
    const gateway = { updateLabelColor, resolveBoard, listBoardLabels };

    const useCase = createChangeLabelColorUseCase(gateway as any);
    const result = await useCase.execute({
      labelName: 'Backend',
      boardId: 'board-1',
      color: 'red',
    });

    expect(result.ok).toBe(true);
    expect(resolveBoard).toHaveBeenCalledWith({ boardId: 'board-1', boardName: undefined });
    expect(listBoardLabels).toHaveBeenCalledWith('board-1');
    expect(updateLabelColor).toHaveBeenCalledWith('label-2', 'red');
  });

  /**
   * Verifica que rechace colores fuera del set soportado por Trello.
   */
  it('debe devolver VALIDATION si el color no es soportado', async () => {
    const updateLabelColor = vi.fn();
    const gateway = { updateLabelColor };

    const useCase = createChangeLabelColorUseCase(gateway as any);
    const result = await useCase.execute({ labelId: 'label-1', color: 'magenta' });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Se esperaba error de validacion');
    }

    expect(result.error.code).toBe(ErrorCode.Validation);
    expect(updateLabelColor).not.toHaveBeenCalled();
  });
});
