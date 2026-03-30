import { describe, expect, it, vi } from 'vitest';

import type { ApplicationDependencies, BootstrapDiagnosticSnapshot } from '../../../src/application/bootstrap.js';
import { createBootstrapHandlers } from '../../../src/mcp/handlers.js';
import { ok } from '../../../src/shared/index.js';

const bootstrapStatusFixture: BootstrapDiagnosticSnapshot = {
  scope: 'bootstrap',
  transport: 'stdio',
  capabilityPolicy: 'diagnostic-plus-search-and-comment',
  toolNames: ['bootstrap.status', 'trello_search_cards', 'trello_add_comment', 'trello_list_boards'],
  trelloRuntimeAvailable: true,
  trelloWriteRuntimeAvailable: true,
  trelloCredentialsConfigured: true,
  defaultBoardConfigured: false,
};

/**
 * Verifica el contrato observable del handler diagnostico que el bootstrap publica hoy.
 */
describe('Handlers MCP del bootstrap', () => {
  /**
   * Asegura que el bootstrap no publique capacidades fuera del diagnostico aprobado.
   */
  it('debe exponer la tool diagnostica y la slice read-only de busqueda', () => {
    const dependencies: ApplicationDependencies = {
      config: {
        TRELLO_API_KEY: 'key-123',
        TRELLO_TOKEN: 'token-123',
        TRELLO_API_BASE_URL: 'https://api.trello.com/1',
      },
      searchCards: {
        execute: vi.fn(async () => ok({ boardId: 'board-1', cards: [], truncated: false })),
      },
      addComment: {
        execute: vi.fn(async () =>
          ok({ id: 'comment-1', text: 'Assigned to Nacho', creator: 'Ignadev', date: '2026-03-29T10:00:00.000Z' })
        ),
      },
      listBoards: {
        execute: vi.fn(async () => ok([])),
      },
      getBootstrapStatus: vi.fn(() => bootstrapStatusFixture),
    };

    const handlers = createBootstrapHandlers(dependencies);

    expect(Object.keys(handlers)).toEqual(['diagnosticTool', 'searchCardsTool', 'addCommentTool', 'listBoardsTool']);
    expect(handlers.diagnosticTool.name).toBe('bootstrap.status');
    expect(handlers.diagnosticTool.title).toBe('Estado de bootstrap');
    expect(handlers.diagnosticTool.description).toContain('search, add-comment y list-boards');
    expect(handlers.searchCardsTool.name).toBe('trello_search_cards');
    expect(handlers.addCommentTool.name).toBe('trello_add_comment');
  });

  /**
   * Confirma que la ejecucion del handler traduzca el snapshot de application sin pedir adapters de Trello.
   */
  it('debe devolver contenido estructurado y textual desde getBootstrapStatus', async () => {
    const getBootstrapStatus = vi.fn(() => bootstrapStatusFixture);
    const dependencies: ApplicationDependencies = {
      config: {
        TRELLO_API_KEY: 'key-123',
        TRELLO_TOKEN: 'token-123',
        TRELLO_API_BASE_URL: 'https://api.trello.com/1',
      },
      searchCards: {
        execute: vi.fn(async () => ok({ boardId: 'board-1', cards: [], truncated: false })),
      },
      addComment: {
        execute: vi.fn(async () =>
          ok({ id: 'comment-1', text: 'Assigned to Nacho', creator: 'Ignadev', date: '2026-03-29T10:00:00.000Z' })
        ),
      },
      listBoards: {
        execute: vi.fn(async () => ok([])),
      },
      getBootstrapStatus,
    };

    const handlers = createBootstrapHandlers(dependencies);
    const result = await handlers.diagnosticTool.execute();

    expect(getBootstrapStatus).toHaveBeenCalledTimes(1);
    expect(result.structuredContent).toEqual(bootstrapStatusFixture);
    expect(result.content).toEqual([
      {
        type: 'text',
        text: [
          'Bootstrap MCP status',
          '- transport target: stdio',
          '- capability policy: diagnostic-plus-search-and-comment',
          '- published tools: bootstrap.status, trello_search_cards, trello_add_comment, trello_list_boards',
          '- Trello runtime available: yes',
          '- Trello write runtime available: yes',
          '- Trello credentials configured: yes',
          '- default board configured: no',
        ].join('\n'),
      },
    ]);
  });

  /**
   * Confirma el contrato observable de la nueva tool read-only sin arrancar transporte MCP real.
   */
  it('debe traducir la salida del caso de uso a contenido textual y estructurado para trello_search_cards', async () => {
    const searchCards = {
      execute: vi.fn(async () =>
        ok({
          boardId: 'board-1',
          truncated: false,
          cards: [
            {
              id: 'card-1',
              name: 'Fix authentication bug',
              idList: 'list-1',
              listName: 'To Do',
              boardId: 'board-1',
              closed: false,
              shortUrl: 'https://trello.com/c/card-1',
              due: null,
            },
          ],
        })
      ),
    };
    const dependencies: ApplicationDependencies = {
      config: {
        TRELLO_API_KEY: 'key-123',
        TRELLO_TOKEN: 'token-123',
        TRELLO_API_BASE_URL: 'https://api.trello.com/1',
      },
      searchCards,
      addComment: {
        execute: vi.fn(async () =>
          ok({ id: 'comment-1', text: 'Assigned to Nacho', creator: 'Ignadev', date: '2026-03-29T10:00:00.000Z' })
        ),
      },
      listBoards: {
        execute: vi.fn(async () => ok([])),
      },
      getBootstrapStatus: vi.fn(() => bootstrapStatusFixture),
    };

    const handlers = createBootstrapHandlers(dependencies);
    const result = await handlers.searchCardsTool.execute({ query: 'auth', limit: 10 });

    expect(searchCards.execute).toHaveBeenCalledWith({ query: 'auth', limit: 10 });
    expect(result.structuredContent).toEqual({
      boardId: 'board-1',
      truncated: false,
      cards: [
        {
          id: 'card-1',
          name: 'Fix authentication bug',
          idList: 'list-1',
          listName: 'To Do',
          boardId: 'board-1',
          closed: false,
          shortUrl: 'https://trello.com/c/card-1',
          due: null,
        },
      ],
    });
  });

  /**
   * Confirma la traduccion de la nueva tool de comentario sin arrancar transporte MCP real.
   */
  it('debe traducir la salida del caso de uso para trello_add_comment', async () => {
    const addComment = {
      execute: vi.fn(async () =>
        ok({
          id: 'comment-1',
          text: 'Assigned to Nacho',
          creator: 'Ignadev',
          date: '2026-03-29T10:00:00.000Z',
        })
      ),
    };
    const dependencies: ApplicationDependencies = {
      config: {
        TRELLO_API_KEY: 'key-123',
        TRELLO_TOKEN: 'token-123',
        TRELLO_API_BASE_URL: 'https://api.trello.com/1',
      },
      searchCards: {
        execute: vi.fn(async () => ok({ boardId: 'board-1', cards: [], truncated: false })),
      },
      addComment,
      listBoards: {
        execute: vi.fn(async () => ok([])),
      },
      getBootstrapStatus: vi.fn(() => bootstrapStatusFixture),
    };

    const handlers = createBootstrapHandlers(dependencies);
    const result = await handlers.addCommentTool.execute({ cardId: 'card-1', text: 'Assigned to Nacho' });

    expect(addComment.execute).toHaveBeenCalledWith({ cardId: 'card-1', text: 'Assigned to Nacho' });
    expect(result.structuredContent).toEqual({
      id: 'comment-1',
      text: 'Assigned to Nacho',
      creator: 'Ignadev',
      date: '2026-03-29T10:00:00.000Z',
    });
  });
});
