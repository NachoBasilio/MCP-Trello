import { describe, expect, it, vi } from 'vitest';

import type { Config } from '../../../src/config/index.js';
import { ErrorCode } from '../../../src/domain/index.js';
import { createCreateCardUseCase } from '../../../src/application/create-card.js';
import { createMoveCardUseCase } from '../../../src/application/move-card.js';
import { createDeleteCardUseCase } from '../../../src/application/delete-card.js';
import { createBoardSummaryUseCase } from '../../../src/application/board-summary.js';
import { createSearchCardsUseCase } from '../../../src/application/search-cards.js';
import { createTrelloSearchCardsAdapter } from '../../../src/infrastructure/trello/adapter.js';
import { createCreateCardTool } from '../../../src/mcp/tools/create-card.js';
import { createMoveCardTool } from '../../../src/mcp/tools/move-card.js';
import { createDeleteCardTool } from '../../../src/mcp/tools/delete-card.js';
import { createSearchCardsTool } from '../../../src/mcp/tools/search-cards.js';
import { createBoardSummaryResource } from '../../../src/mcp/resources/board-summary.js';

const baseConfig: Config = {
  TRELLO_API_KEY: 'key-123',
  TRELLO_TOKEN: 'token-123',
  TRELLO_API_BASE_URL: 'https://api.trello.com/1',
  TRELLO_DEFAULT_BOARD_ID: 'board-default',
};

/**
 * Integra handler MCP + caso de uso + adapter real con fetch mockeado.
 */
describe('Integracion de capacidades MCP Trello', () => {
  /**
   * Cubre flujo create-card desde llamada MCP hasta fetch de Trello.
   */
  it('debe crear una tarjeta desde el tool trello_create_card', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([{ id: 'list-1', name: 'To Do', idBoard: 'board-1' }]),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 'card-1',
            name: 'Fix login bug',
            idList: 'list-1',
            idBoard: 'board-1',
            desc: '',
            closed: false,
            shortUrl: 'https://trello.com/c/card-1',
            due: null,
            idLabels: [],
          }),
          { status: 200 }
        )
      );

    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);
    const useCase = createCreateCardUseCase(adapter);
    const tool = createCreateCardTool(useCase);

    const response = await tool.execute({
      name: 'Fix login bug',
      boardId: 'board-1',
      listName: 'To Do',
      pos: 'bottom',
    });

    expect(response.structuredContent).toEqual({
      id: 'card-1',
      name: 'Fix login bug',
      listId: 'list-1',
      boardId: 'board-1',
      url: 'https://trello.com/c/card-1',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/boards/board-1/lists');
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/cards?');
  });

  /**
   * Cubre flujo move-card ambiguo y confirma codigo de error esperado.
   */
  it('debe devolver error ambiguo en trello_move_card cuando el nombre matchea multiples tarjetas', async () => {
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
              name: 'Fix login bug',
              idList: 'list-1',
              idBoard: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-1',
              due: null,
            },
            {
              id: 'card-2',
              name: 'Login timeout',
              idList: 'list-1',
              idBoard: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-2',
              due: null,
            },
          ]),
          { status: 200 }
        )
      );

    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);
    const useCase = createMoveCardUseCase(adapter);
    const tool = createMoveCardTool(useCase);

    await expect(
      tool.execute({
        cardName: 'login',
        toList: 'Done',
        boardId: 'board-1',
      })
    ).rejects.toMatchObject({ code: ErrorCode.CardAmbiguous });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  /**
   * Cubre resource board-summary con JSON serializado esperado.
   */
  it('debe devolver el formato esperado en trello://boards/{id}/summary', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            { id: 'list-1', name: 'To Do', idBoard: 'board-1' },
            { id: 'list-2', name: 'Done', idBoard: 'board-1' },
          ]),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 'list-1', name: 'To Do' }, { id: 'list-2', name: 'Done' }]), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 'card-1',
              name: 'Fix login bug',
              idList: 'list-1',
              idBoard: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-1',
              due: null,
            },
          ]),
          { status: 200 }
        )
      );

    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);
    const useCase = createBoardSummaryUseCase(adapter);
    const resource = createBoardSummaryResource(useCase);

    const response = await resource.read(new URL('trello://boards/board-1/summary'), {
      boardId: 'board-1',
    });

    const firstContent = response.contents[0];

    expect(firstContent?.mimeType).toBe('application/json');
    expect(firstContent && 'text' in firstContent).toBe(true);

    if (!firstContent || !('text' in firstContent)) {
      throw new Error('Se esperaba contenido textual en el resource board-summary');
    }

    expect(firstContent.text).toContain('"boardId": "board-1"');
    expect(firstContent.text).toContain('"listCount": 2');
    expect(firstContent.text).toContain('"cardCount": 1');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  /**
   * Cubre boundary de search (terminos multiples, palabra parcial y truncado) atravesando tool+usecase+adapter.
   */
  it('debe respetar terminos AND, match parcial y truncado en trello_search_cards', async () => {
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
              idBoard: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-1',
              due: null,
            },
            {
              id: 'card-2',
              name: 'AuthenticationService fix',
              idList: 'list-1',
              idBoard: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-2',
              due: null,
            },
            {
              id: 'card-3',
              name: 'Refactor UI',
              idList: 'list-1',
              idBoard: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-3',
              due: null,
            },
          ]),
          { status: 200 }
        )
      );

    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);
    const useCase = createSearchCardsUseCase(adapter);
    const tool = createSearchCardsTool(useCase);

    const response = await tool.execute({
      query: 'auth fix',
      boardId: 'board-1',
      limit: 1,
    });

    expect(response.structuredContent).toMatchObject({
      boardId: 'board-1',
      truncated: true,
      cards: [
        {
          id: 'card-1',
          name: 'Fix authentication bug',
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  /**
   * Cubre flujo de eliminar tarjeta y confirma que el adapter efectua el DELETE real.
   */
  it('debe eliminar una tarjeta por id desde el tool trello_delete_card', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 200 }));

    const adapter = createTrelloSearchCardsAdapter(baseConfig, fetchMock as typeof fetch);
    const useCase = createDeleteCardUseCase(adapter);
    const tool = createDeleteCardTool(useCase);

    const response = await tool.execute({
      cardId: 'card-123',
    });

    expect(response.structuredContent).toEqual({
      id: 'card-123',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/cards/card-123');
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('DELETE');
  });
});
