import { describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '../../../../src/domain/index.js';
import { createTrelloSearchCardsAdapter } from '../../../../src/infrastructure/trello/adapter.js';

const baseConfig = {
  TRELLO_API_KEY: 'key-123',
  TRELLO_TOKEN: 'token-123',
  TRELLO_API_BASE_URL: 'https://api.trello.com/1',
  TRELLO_DEFAULT_BOARD_ID: 'board-default',
};

/**
 * Verifica el boundary HTTP minimo del adapter de lectura sin tocar Trello real.
 */
describe('Adapter de busqueda de tarjetas en Trello', () => {
  /**
   * Confirma que el adapter resuelve board efectivo, consulta listas y tarjetas, y devuelve el contrato interno esperado.
   */
  it('debe mapear tarjetas y nombres de lista usando el board resuelto', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 'list-1', name: 'To Do' }]), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 'card-1',
              name: 'Fix authentication bug',
              idList: 'list-1',
              idBoard: 'board-default',
              closed: false,
              shortUrl: 'https://trello.com/c/card-1',
              due: null,
            },
          ]),
          { status: 200 }
        )
      );

    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);
    const boardId = await adapter.resolveBoardId();
    const cards = await adapter.listCards('board-default');

    expect(boardId).toEqual({ ok: true, value: 'board-default' });
    expect(cards).toEqual({
      ok: true,
      value: [
        {
          id: 'card-1',
          name: 'Fix authentication bug',
          idList: 'list-1',
          listName: 'To Do',
          boardId: 'board-default',
          closed: false,
          shortUrl: 'https://trello.com/c/card-1',
          due: null,
        },
      ],
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.trello.com/1/boards/board-default/lists?key=key-123&token=token-123&fields=name'
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.trello.com/1/boards/board-default/cards?key=key-123&token=token-123&fields=id%2Cname%2CidList%2CidBoard%2Cclosed%2CshortUrl%2Cdue&filter=all'
    );
  });

  /**
   * Valida que un 404 se traduzca al error de dominio esperado por capas superiores.
   */
  it('debe traducir 404 a un DomainError de board inaccesible', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('missing board', { status: 404 }));
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.listCards('board-missing');

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('Se esperaba un resultado fallido');
    }

    expect(result.error.code).toBe(ErrorCode.BoardNotFound);
    expect(result.error.message).toBe('Board not found or inaccessible');
  });

  /**
   * Verifica el POST minimo de comentarios y el mapeo de la accion de Trello al contrato interno `Comment`.
   */
  it('debe publicar un comentario y mapear creator y date desde la accion devuelta por Trello', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'action-1',
          date: '2026-03-29T10:00:00.000Z',
          data: {
            text: 'Assigned to Nacho',
          },
          memberCreator: {
            fullName: 'Ignadev',
            username: 'ignadev',
          },
        }),
        { status: 200 }
      )
    );
    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);

    const result = await adapter.addComment('card-1', 'Assigned to Nacho');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.trello.com/1/cards/card-1/actions/comments?key=key-123&token=token-123&text=Assigned+to+Nacho',
      {
        method: 'POST',
      }
    );
    expect(result).toEqual({
      ok: true,
      value: {
        id: 'action-1',
        text: 'Assigned to Nacho',
        creator: 'Ignadev',
        date: '2026-03-29T10:00:00.000Z',
      },
    });
  });
});
