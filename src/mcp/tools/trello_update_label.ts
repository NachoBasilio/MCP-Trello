import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { UpdateLabelUseCase } from '../../application/update-label.js';
import { isErr } from '../../shared/index.js';
import {
  trelloUpdateLabelInputSchema,
  trelloUpdateLabelInputSchemaBase,
  trelloUpdateLabelOutputSchema,
} from '../../types/tool-contract.js';

export interface UpdateLabelToolHandler {
  name: 'trello_update_label';
  title: string;
  description: string;
  inputSchema: typeof trelloUpdateLabelInputSchemaBase.shape;
  outputSchema: typeof trelloUpdateLabelOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Tool MCP para actualizar nombre y/o color de una label.
 */
export const createUpdateLabelTool = (useCase: UpdateLabelUseCase): UpdateLabelToolHandler => {
  return {
    name: 'trello_update_label',
    title: 'Actualizar label',
    description: 'Permite renombrar y cambiar el color de una label existente dentro de un board.',
    inputSchema: trelloUpdateLabelInputSchemaBase.shape,
    outputSchema: trelloUpdateLabelOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = trelloUpdateLabelInputSchema.parse(arguments_ ?? {});
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloUpdateLabelOutputSchema.parse({ label: result.value.label });

      return {
        content: [
          {
            type: 'text',
            text: formatUpdatedLabelText(output),
          },
        ],
        structuredContent: output,
      };
    },
  };
};

const formatUpdatedLabelText = (
  output: zod.infer<typeof trelloUpdateLabelOutputSchema>
): string => {
  return `Label ${output.label.name} (${output.label.id}) ahora tiene color ${output.label.color}`;
};
