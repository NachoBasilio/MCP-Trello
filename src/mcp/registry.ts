import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerOptions } from '@modelcontextprotocol/sdk/server/index.js';
import type { Implementation, ServerCapabilities } from '@modelcontextprotocol/sdk/types.js';

import type { BootstrapHandlers } from './handlers.js';

export interface BootstrapServerDefinition {
  info: Implementation;
  options: ServerOptions;
}

export const bootstrapServerDefinition: BootstrapServerDefinition = {
  info: {
    name: 'server-mcp-trello',
    version: '0.1.0',
  },
  options: {
    capabilities: {
      tools: {},
      resources: {},
    },
    instructions:
      'Servidor MCP para Trello. Expone 15 tools: bootstrap.status, trello_search_cards, trello_add_comment, trello_list_boards, trello_list_columns, trello_create_card, trello_move_card, trello_delete_card, trello_add_labels, trello_change_label_color, trello_list_board_labels, trello_resolve_label, trello_list_label_cards, trello_search_cards_by_label y trello_update_label. Además expone 3 resources: board-summary, board-overdue y board-by-label.',
  },
};

export const bootstrapServerCapabilities: ServerCapabilities = bootstrapServerDefinition.options.capabilities ?? {};

/**
 * Registra todas las capacidades MCP del servidor.
 */
export const registerBootstrapCapabilities = (server: McpServer, handlers: BootstrapHandlers): void => {
  server.registerTool(
    handlers.diagnosticTool.name,
    {
      title: handlers.diagnosticTool.title,
      description: handlers.diagnosticTool.description,
      outputSchema: handlers.diagnosticTool.outputSchema,
    },
    handlers.diagnosticTool.execute
  );

  server.registerTool(
    handlers.searchCardsTool.name,
    {
      title: handlers.searchCardsTool.title,
      description: handlers.searchCardsTool.description,
      inputSchema: handlers.searchCardsTool.inputSchema,
      outputSchema: handlers.searchCardsTool.outputSchema,
    },
    handlers.searchCardsTool.execute
  );

  server.registerTool(
    handlers.addCommentTool.name,
    {
      title: handlers.addCommentTool.title,
      description: handlers.addCommentTool.description,
      inputSchema: handlers.addCommentTool.inputSchema,
      outputSchema: handlers.addCommentTool.outputSchema,
    },
    handlers.addCommentTool.execute
  );

  server.registerTool(
    handlers.listBoardsTool.name,
    {
      title: handlers.listBoardsTool.title,
      description: handlers.listBoardsTool.description,
      outputSchema: handlers.listBoardsTool.outputSchema,
    },
    handlers.listBoardsTool.execute
  );

  server.registerTool(
    handlers.createCardTool.name,
    {
      title: handlers.createCardTool.title,
      description: handlers.createCardTool.description,
      inputSchema: handlers.createCardTool.inputSchema,
      outputSchema: handlers.createCardTool.outputSchema,
    },
    handlers.createCardTool.execute
  );

  server.registerTool(
    handlers.listColumnsTool.name,
    {
      title: handlers.listColumnsTool.title,
      description: handlers.listColumnsTool.description,
      inputSchema: handlers.listColumnsTool.inputSchema,
      outputSchema: handlers.listColumnsTool.outputSchema,
    },
    handlers.listColumnsTool.execute
  );

  server.registerTool(
    handlers.moveCardTool.name,
    {
      title: handlers.moveCardTool.title,
      description: handlers.moveCardTool.description,
      inputSchema: handlers.moveCardTool.inputSchema,
      outputSchema: handlers.moveCardTool.outputSchema,
    },
    handlers.moveCardTool.execute
  );

  server.registerTool(
    handlers.deleteCardTool.name,
    {
      title: handlers.deleteCardTool.title,
      description: handlers.deleteCardTool.description,
      inputSchema: handlers.deleteCardTool.inputSchema,
      outputSchema: handlers.deleteCardTool.outputSchema,
    },
    handlers.deleteCardTool.execute
  );

  server.registerTool(
    handlers.addLabelsTool.name,
    {
      title: handlers.addLabelsTool.title,
      description: handlers.addLabelsTool.description,
      inputSchema: handlers.addLabelsTool.inputSchema,
      outputSchema: handlers.addLabelsTool.outputSchema,
    },
    handlers.addLabelsTool.execute
  );

  server.registerTool(
    handlers.changeLabelColorTool.name,
    {
      title: handlers.changeLabelColorTool.title,
      description: handlers.changeLabelColorTool.description,
      inputSchema: handlers.changeLabelColorTool.inputSchema,
      outputSchema: handlers.changeLabelColorTool.outputSchema,
    },
    handlers.changeLabelColorTool.execute
  );

  server.registerTool(
    handlers.listBoardLabelsTool.name,
    {
      title: handlers.listBoardLabelsTool.title,
      description: handlers.listBoardLabelsTool.description,
      inputSchema: handlers.listBoardLabelsTool.inputSchema,
      outputSchema: handlers.listBoardLabelsTool.outputSchema,
    },
    handlers.listBoardLabelsTool.execute
  );

  server.registerTool(
    handlers.resolveLabelTool.name,
    {
      title: handlers.resolveLabelTool.title,
      description: handlers.resolveLabelTool.description,
      inputSchema: handlers.resolveLabelTool.inputSchema,
      outputSchema: handlers.resolveLabelTool.outputSchema,
    },
    handlers.resolveLabelTool.execute
  );

  server.registerTool(
    handlers.listLabelCardsTool.name,
    {
      title: handlers.listLabelCardsTool.title,
      description: handlers.listLabelCardsTool.description,
      inputSchema: handlers.listLabelCardsTool.inputSchema,
      outputSchema: handlers.listLabelCardsTool.outputSchema,
    },
    handlers.listLabelCardsTool.execute
  );

  server.registerTool(
    handlers.searchCardsByLabelTool.name,
    {
      title: handlers.searchCardsByLabelTool.title,
      description: handlers.searchCardsByLabelTool.description,
      inputSchema: handlers.searchCardsByLabelTool.inputSchema,
      outputSchema: handlers.searchCardsByLabelTool.outputSchema,
    },
    handlers.searchCardsByLabelTool.execute
  );

  server.registerTool(
    handlers.updateLabelTool.name,
    {
      title: handlers.updateLabelTool.title,
      description: handlers.updateLabelTool.description,
      inputSchema: handlers.updateLabelTool.inputSchema,
      outputSchema: handlers.updateLabelTool.outputSchema,
    },
    handlers.updateLabelTool.execute
  );

  server.registerResource(
    handlers.boardSummaryResource.name,
    handlers.boardSummaryResource.template,
    handlers.boardSummaryResource.metadata,
    handlers.boardSummaryResource.read
  );

  server.registerResource(
    handlers.boardOverdueResource.name,
    handlers.boardOverdueResource.template,
    handlers.boardOverdueResource.metadata,
    handlers.boardOverdueResource.read
  );

  server.registerResource(
    handlers.boardByLabelResource.name,
    handlers.boardByLabelResource.template,
    handlers.boardByLabelResource.metadata,
    handlers.boardByLabelResource.read
  );
};
