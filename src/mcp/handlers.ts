import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ApplicationDependencies, BootstrapDiagnosticSnapshot } from '../application/bootstrap.js';

const bootstrapStatusOutputSchema = {
  scope: zod.literal('bootstrap'),
  transport: zod.literal('stdio'),
  capabilityPolicy: zod.literal('diagnostic-only'),
  toolName: zod.literal('bootstrap.status'),
  trelloRuntimeAvailable: zod.literal(false),
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
}

const formatBootstrapStatusText = (status: BootstrapDiagnosticSnapshot): string => {
  return [
    'Bootstrap MCP status',
    `- transport target: ${status.transport}`,
    `- capability policy: ${status.capabilityPolicy}`,
    `- Trello runtime available: ${status.trelloRuntimeAvailable ? 'yes' : 'no'}`,
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
      description: 'Expone el estado diagnostico minimo del bootstrap MCP local sin anunciar runtime de Trello.',
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
  };
};
