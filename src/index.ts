import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { createAddCommentUseCase } from './application/add-comment.js';
import { createDeleteCardUseCase } from './application/delete-card.js';
import { createAddLabelsUseCase } from './application/add-labels.js';
import { createChangeLabelColorUseCase } from './application/change-label-color.js';
import { createBoardByLabelUseCase } from './application/board-by-label.js';
import { createBoardOverdueUseCase } from './application/board-overdue.js';
import { createBoardSummaryUseCase } from './application/board-summary.js';
import { createApplicationDependencies } from './application/bootstrap.js';
import { createCreateCardUseCase } from './application/create-card.js';
import { createListBoardsUseCase } from './application/list-boards.js';
import { createListBoardLabelsUseCase } from './application/list-board-labels.js';
import { createListLabelCardsUseCase } from './application/list-label-cards.js';
import { createListColumnsUseCase } from './application/list-columns.js';
import { createMoveCardUseCase } from './application/move-card.js';
import { createSearchCardsUseCase } from './application/search-cards.js';
import { createSearchCardsByLabelUseCase } from './application/search-cards-by-label.js';
import { createResolveLabelUseCase } from './application/resolve-label.js';
import { createUpdateLabelUseCase } from './application/update-label.js';
import { loadConfig } from './config/index.js';
import { isDomainError } from './domain/index.js';
import { createTrelloSearchCardsAdapter } from './infrastructure/trello/adapter.js';
import { createBootstrapHandlers } from './mcp/handlers.js';
import { bootstrapServerDefinition, registerBootstrapCapabilities } from './mcp/registry.js';

/**
 * Traduce fallos fatales de arranque a un mensaje accionable sin inventar soporte de runtime Trello.
 */
const formatFatalStartupError = (error: unknown): string => {
  if (isDomainError(error)) {
    return `[${error.code}] ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown startup error';
};

/**
 * Arranca el servidor MCP con todas las capacidades Trello activas.
 */
const main = async (): Promise<void> => {
  const config = loadConfig();
  const trelloGateway = createTrelloSearchCardsAdapter(config);
  const searchCards = createSearchCardsUseCase(trelloGateway);
  const addComment = createAddCommentUseCase(trelloGateway);
  const listBoards = createListBoardsUseCase(trelloGateway);
  const listColumns = createListColumnsUseCase(trelloGateway);
  const createCard = createCreateCardUseCase(trelloGateway);
  const moveCard = createMoveCardUseCase(trelloGateway);
  const deleteCard = createDeleteCardUseCase(trelloGateway);
  const addLabels = createAddLabelsUseCase(trelloGateway);
  const changeLabelColor = createChangeLabelColorUseCase(trelloGateway);
  const boardSummary = createBoardSummaryUseCase(trelloGateway);
  const boardOverdue = createBoardOverdueUseCase(trelloGateway);
  const listBoardLabels = createListBoardLabelsUseCase(trelloGateway);
  const resolveLabel = createResolveLabelUseCase(trelloGateway);
  const listLabelCards = createListLabelCardsUseCase(trelloGateway, resolveLabel);
  const searchCardsByLabel = createSearchCardsByLabelUseCase(listLabelCards);
  const updateLabel = createUpdateLabelUseCase(trelloGateway, resolveLabel);
  const boardByLabel = createBoardByLabelUseCase(listLabelCards);
  const dependencies = createApplicationDependencies(config, {
    searchCards,
    addComment,
    listBoards,
    listColumns,
    createCard,
    moveCard,
    deleteCard,
    addLabels,
    changeLabelColor,
    boardSummary,
    boardOverdue,
    boardByLabel,
    listBoardLabels,
    resolveLabel,
    listLabelCards,
    searchCardsByLabel,
    updateLabel,
  });
  const handlers = createBootstrapHandlers(dependencies);
  const server = new McpServer(bootstrapServerDefinition.info, bootstrapServerDefinition.options);

  registerBootstrapCapabilities(server, handlers);

  const transport = new StdioServerTransport();
  await server.connect(transport);
};

void main().catch((error: unknown) => {
  console.error(`Fatal MCP bootstrap startup error: ${formatFatalStartupError(error)}`);
  process.exit(1);
});
