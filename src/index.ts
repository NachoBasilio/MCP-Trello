import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { createAddCommentUseCase } from './application/add-comment.js';
import { createApplicationDependencies } from './application/bootstrap.js';
import { createListBoardsUseCase } from './application/list-boards.js';
import { createSearchCardsUseCase } from './application/search-cards.js';
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
 * Arranca el bootstrap MCP local para OpenCode sobre `stdio` usando solo las capacidades diagnosticas reales del repo.
 */
const main = async (): Promise<void> => {
  const config = loadConfig();
  const trelloGateway = createTrelloSearchCardsAdapter(config);
  const searchCards = createSearchCardsUseCase(trelloGateway);
  const addComment = createAddCommentUseCase(trelloGateway);
  const listBoards = createListBoardsUseCase(trelloGateway);
  const dependencies = createApplicationDependencies(config, { searchCards, addComment, listBoards });
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
