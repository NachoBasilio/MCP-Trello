import { describe, expect, it, vi } from 'vitest';

import type { ApplicationDependencies, BootstrapDiagnosticSnapshot } from '../../../src/application/bootstrap.js';
import { createBootstrapHandlers } from '../../../src/mcp/handlers.js';
import { ok } from '../../../src/shared/index.js';

const emptyCard = { id: '', name: '', listId: '', boardId: '', url: '' };

const mockUseCase = (returnValue: unknown = ok(emptyCard)) => ({
  execute: vi.fn(async () => returnValue),
}) as any;

const bootstrapStatusFixture: BootstrapDiagnosticSnapshot = {
  scope: 'bootstrap',
  transport: 'stdio',
  capabilityPolicy: 'diagnostic-plus-full-trello',
  toolNames: [
    'bootstrap.status',
    'trello_search_cards',
    'trello_add_comment',
    'trello_list_boards',
    'trello_list_columns',
    'trello_create_card',
    'trello_move_card',
    'trello_delete_card',
    'trello_add_labels',
  ],
  trelloRuntimeAvailable: true,
  trelloWriteRuntimeAvailable: true,
  trelloCredentialsConfigured: true,
  defaultBoardConfigured: false,
};

const baseDependencies: ApplicationDependencies = {
  config: {
    TRELLO_API_KEY: 'key-123',
    TRELLO_TOKEN: 'token-123',
    TRELLO_API_BASE_URL: 'https://api.trello.com/1',
  },
  searchCards: mockUseCase(ok({ boardId: 'board-1', cards: [], truncated: false })),
  addComment: mockUseCase(
    ok({ id: 'comment-1', text: 'Assigned to Nacho', creator: 'Ignadev', date: '2026-03-29T10:00:00.000Z' })
  ),
  listBoards: mockUseCase(ok([])),
  listColumns: mockUseCase(ok({ boardId: 'board-1', columns: [] })),
  createCard: mockUseCase(),
  moveCard: mockUseCase(),
  deleteCard: mockUseCase(),
  addLabels: mockUseCase(ok([])),
  boardSummary: mockUseCase(ok({ boardId: 'board-1', listCount: 3, cardCount: 10, lists: [] })),
  boardOverdue: mockUseCase(ok({ boardId: 'board-1', overdueCards: [], overdueCount: 0 })),
  boardByLabel: mockUseCase(ok({ boardId: 'board-1', labelName: 'bug', matchingCards: [], cardCount: 0 })),
  getBootstrapStatus: vi.fn(() => bootstrapStatusFixture),
};

/**
 * Verifica el contrato observable de los handlers MCP.
 */
describe('Handlers MCP del servidor', () => {
  /**
   * Asegura que el handler registre todas las tools y resources del servidor.
   */
  it('debe exponer todas las tools y resources del servidor', () => {
    const handlers = createBootstrapHandlers({ ...baseDependencies });

    expect(Object.keys(handlers)).toEqual([
      'diagnosticTool',
      'searchCardsTool',
      'addCommentTool',
      'listBoardsTool',
      'listColumnsTool',
      'createCardTool',
      'moveCardTool',
      'deleteCardTool',
      'addLabelsTool',
      'boardSummaryResource',
      'boardOverdueResource',
      'boardByLabelResource',
    ]);
    expect(handlers.diagnosticTool.name).toBe('bootstrap.status');
    expect(handlers.searchCardsTool.name).toBe('trello_search_cards');
    expect(handlers.addCommentTool.name).toBe('trello_add_comment');
    expect(handlers.listBoardsTool.name).toBe('trello_list_boards');
    expect(handlers.listColumnsTool.name).toBe('trello_list_columns');
    expect(handlers.createCardTool.name).toBe('trello_create_card');
    expect(handlers.moveCardTool.name).toBe('trello_move_card');
    expect(handlers.deleteCardTool.name).toBe('trello_delete_card');
    expect(handlers.addLabelsTool.name).toBe('trello_add_labels');
    expect(handlers.boardSummaryResource.name).toBe('board-summary');
    expect(handlers.boardOverdueResource.name).toBe('board-overdue');
    expect(handlers.boardByLabelResource.name).toBe('board-by-label');
  });

  /**
   * Confirma que la ejecucion del handler diagnostico devuelva el snapshot correcto.
   */
  it('debe devolver contenido estructurado y textual desde getBootstrapStatus', async () => {
    const handlers = createBootstrapHandlers({ ...baseDependencies });
    const result = await handlers.diagnosticTool.execute();

    expect(baseDependencies.getBootstrapStatus).toHaveBeenCalledTimes(1);
    expect(result.structuredContent).toEqual(bootstrapStatusFixture);
  });

  /**
   * Confirma el contrato de trello_search_cards.
   */
  it('debe traducir la salida del caso de uso para trello_search_cards', async () => {
    const searchCards = mockUseCase(
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
    );
    const handlers = createBootstrapHandlers({ ...baseDependencies, searchCards });
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
   * Confirma la traduccion de trello_add_comment.
   */
  it('debe traducir la salida del caso de uso para trello_add_comment', async () => {
    const addComment = mockUseCase(
      ok({
        id: 'comment-1',
        text: 'Assigned to Nacho',
        creator: 'Ignadev',
        date: '2026-03-29T10:00:00.000Z',
      })
    );
    const handlers = createBootstrapHandlers({ ...baseDependencies, addComment });
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
