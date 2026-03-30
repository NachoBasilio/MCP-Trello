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
    },
    instructions:
      'Bootstrap MCP local para OpenCode sobre stdio. Expone bootstrap.status, trello_search_cards, trello_add_comment y trello_list_boards; el resto del runtime de Trello sigue fuera de alcance.',
  },
};

export const bootstrapServerCapabilities: ServerCapabilities = bootstrapServerDefinition.options.capabilities ?? {};

/**
 * Registra las capacidades reales del bootstrap sin mezclar el wiring del SDK en el entrypoint.
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
};
