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
      'Bootstrap MCP local para OpenCode sobre stdio. Solo expone una tool diagnostica y todavia no publica runtime de Trello.',
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
};
