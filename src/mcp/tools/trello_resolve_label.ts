import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import type { ResolveLabelUseCase } from '../../application/resolve-label.js';
import { isErr } from '../../shared/index.js';
import {
  trelloResolveLabelInputSchema,
  trelloResolveLabelInputSchemaBase,
  trelloResolveLabelOutputSchema,
} from '../../types/tool-contract.js';

export interface ResolveLabelToolHandler {
  name: 'trello_resolve_label';
  title: string;
  description: string;
  inputSchema: typeof trelloResolveLabelInputSchemaBase.shape;
  outputSchema: typeof trelloResolveLabelOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Tool MCP para resolver una label por nombre dentro de un board.
 */
export const createResolveLabelTool = (useCase: ResolveLabelUseCase): ResolveLabelToolHandler => {
  return {
    name: 'trello_resolve_label',
    title: 'Resolver label del board',
    description:
      'Resuelve una label por nombre dentro de un board y devuelve su metadata completa o errores de ambigüedad.',
    inputSchema: trelloResolveLabelInputSchemaBase.shape,
    outputSchema: trelloResolveLabelOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = trelloResolveLabelInputSchema.parse(arguments_ ?? {});
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloResolveLabelOutputSchema.parse(result.value);

      return {
        content: [
          {
            type: 'text',
            text: `Label ${output.label.name} (${output.label.id}) en board ${output.boardId} con color ${output.label.color}`,
          },
        ],
        structuredContent: output,
      };
    },
  };
};
