import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ApplicationDependencies, BootstrapDiagnosticSnapshot } from '../application/bootstrap.js';
import { createAddCommentTool, type AddCommentToolHandler } from './tools/add-comment.js';
import { createSearchCardsTool, type SearchCardsToolHandler } from './tools/search-cards.js';

const bootstrapStatusOutputSchema = {
  scope: zod.literal('bootstrap'),
  transport: zod.literal('stdio'),
  capabilityPolicy: zod.literal('diagnostic-plus-search-and-comment'),
  toolNames: zod.tuple([
    zod.literal('bootstrap.status'),
    zod.literal('trello_search_cards'),
    zod.literal('trello_add_comment'),
  ]),
  trelloRuntimeAvailable: zod.literal(true),
  trelloWriteRuntimeAvailable: zod.literal(true),
  trelloCredentialsConfigured: zod.boolean(),
  defaultBoardConfigured: zod.boolean(),
};

export interface BootstrapToolHandler {
  name: 'bootstrap.status';
  title: string;
  description: string;
  outputSchema: typeof bootstrapStatusOutputSchema;
  execute: () => Promise<CallToolResult>;
}

export interface BootstrapHandlers {
  diagnosticTool: BootstrapToolHandler;
  searchCardsTool: SearchCardsToolHandler;
  addCommentTool: AddCommentToolHandler;
}

const formatBootstrapStatusText = (status: BootstrapDiagnosticSnapshot): string => {
  return [
    'Bootstrap MCP status',
    `- transport target: ${status.transport}`,
    `- capability policy: ${status.capabilityPolicy}`,
    `- published tools: ${status.toolNames.join(', ')}`,
    `- Trello runtime available: ${status.trelloRuntimeAvailable ? 'yes' : 'no'}`,
    `- Trello write runtime available: ${status.trelloWriteRuntimeAvailable ? 'yes' : 'no'}`,
    `- Trello credentials configured: ${status.trelloCredentialsConfigured ? 'yes' : 'no'}`,
    `- default board configured: ${status.defaultBoardConfigured ? 'yes' : 'no'}`,
  ].join('\n');
};

/**
 * Agrupa los handlers MCP del bootstrap inicial sin depender todavia de adapters de Trello.
 */
export const createBootstrapHandlers = (dependencies: ApplicationDependencies): BootstrapHandlers => {
  return {
    diagnosticTool: {
      name: 'bootstrap.status',
      title: 'Estado de bootstrap',
      description: 'Expone el estado diagnostico del bootstrap MCP local y deja explicito que hoy solo existen search y add-comment como slices Trello reales.',
      outputSchema: bootstrapStatusOutputSchema,
      execute: async (): Promise<CallToolResult> => {
        const status = dependencies.getBootstrapStatus();

        return {
          content: [
            {
              type: 'text',
              text: formatBootstrapStatusText(status),
            },
          ],
          structuredContent: { ...status },
        };
      },
    },
    searchCardsTool: createSearchCardsTool(dependencies.searchCards),
    addCommentTool: createAddCommentTool(dependencies.addComment),
  };
};
