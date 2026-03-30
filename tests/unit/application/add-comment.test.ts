import { describe, expect, it, vi } from 'vitest';

import { createAddCommentUseCase } from '../../../src/application/add-comment.js';
import { ErrorCode, type CardSummary } from '../../../src/domain/index.js';
import { ok } from '../../../src/shared/index.js';

/**
 * Protege la slice minima de comentario y su resolucion de tarjeta sin tocar Trello real.
 */
describe('Caso de uso AddComment', () => {
  /**
   * Verifica que `cardId` evite una busqueda adicional y delegue directo al puerto de comentario.
   */
  it('debe comentar directo cuando recibe cardId', async () => {
    const addComment = vi.fn(async () =>
      ok({
        id: 'comment-1',
        text: 'Assigned to Nacho',
        creator: 'Ignadev',
        date: '2026-03-29T10:00:00.000Z',
      })
    );
    const resolveBoardId = vi.fn();
    const listCards = vi.fn();
    const listBoards = vi.fn();
    const resolveBoard = vi.fn();
    const useCase = createAddCommentUseCase({
      resolveBoardId,
      listCards,
      addComment,
      listBoards,
      resolveBoard,
    });

    const result = await useCase.execute({ cardId: 'card-1', text: 'Assigned to Nacho' });

    expect(addComment).toHaveBeenCalledWith('card-1', 'Assigned to Nacho');
    expect(resolveBoard).not.toHaveBeenCalled();
    expect(listCards).not.toHaveBeenCalled();
    expect(result).toEqual(
      ok({
        id: 'comment-1',
        text: 'Assigned to Nacho',
        creator: 'Ignadev',
        date: '2026-03-29T10:00:00.000Z',
      })
    );
  });

  /**
   * Confirma que el caso de uso falle antes de tocar el puerto si el texto llega vacio o en blanco.
   */
  it('debe rechazar texto vacio sin consultar el puerto', async () => {
    const useCase = createAddCommentUseCase({
      resolveBoardId: vi.fn(async () => ok('board-1')),
      listCards: vi.fn(async () => ok([])),
      addComment: vi.fn(async () => {
        throw new Error('No deberia ejecutarse');
      }),
      listBoards: vi.fn(async () => ok([])),
      resolveBoard: vi.fn(async () => ok('board-1')),
    });

    const result = await useCase.execute({ cardName: 'Task', text: '   ' });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Se esperaba un resultado fallido');
    }

    expect(result.error.code).toBe(ErrorCode.CommentEmpty);
    expect(result.error.message).toBe('Comment text cannot be empty');
  });

  /**
   * Asegura que la resolucion por nombre reutilice `CardQuery` y devuelva ambiguedad observable si hay multiples matches.
   */
  it('debe devolver error ambiguo cuando cardName coincide con multiples tarjetas', async () => {
    const cards: CardSummary[] = [
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
        name: 'Login timeout',
        idList: 'list-2',
        listName: 'Doing',
        boardId: 'board-1',
        closed: false,
        shortUrl: 'https://trello.com/c/card-2',
        due: null,
      },
    ];
    const addComment = vi.fn();
    const useCase = createAddCommentUseCase({
      resolveBoardId: vi.fn(async () => ok('board-1')),
      listCards: vi.fn(async () => ok(cards)),
      addComment,
      listBoards: vi.fn(async () => ok([])),
      resolveBoard: vi.fn(async () => ok('board-1')),
    });

    const result = await useCase.execute({ cardName: 'login', text: 'Assigned to Nacho' });

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Se esperaba un resultado fallido');
    }

    expect(result.error.code).toBe(ErrorCode.CardAmbiguous);
    expect(addComment).not.toHaveBeenCalled();
  });
});
