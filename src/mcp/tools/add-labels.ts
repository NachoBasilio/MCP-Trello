import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { AddLabelsUseCase } from '../../application/add-labels.js';
import { isErr } from '../../shared/index.js';

export const addLabelsInputSchema = zod.object({
  cardId: zod.string().trim().min(1, 'cardId is required'),
  labels: zod.array(zod.string().trim().min(1)).min(1, 'At least one label is required'),
  boardId: zod.string().trim().min(1).optional(),
  boardName: zod.string().trim().min(1).optional(),
  createIfMissing: zod.boolean().optional().default(false),
});

export const addLabelsOutputSchema = zod.object({
  addedLabels: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
      color: zod.string(),
    })
  ),
});

export interface AddLabelsToolHandler {
  name: 'trello_add_labels';
  title: string;
  description: string;
  inputSchema: typeof addLabelsInputSchema.shape;
  outputSchema: typeof addLabelsOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Handler MCP para agregar labels a tarjetas en Trello.
 */
export const createAddLabelsTool = (useCase: AddLabelsUseCase): AddLabelsToolHandler => {
  return {
    name: 'trello_add_labels',
    title: 'Agregar labels a tarjeta',
    description:
      'Agrega labels a una tarjeta existente, creandolas si no existen y createIfMissing es true.',
    inputSchema: addLabelsInputSchema.shape,
    outputSchema: addLabelsOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = addLabelsInputSchema.parse(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = {
        addedLabels: result.value.map((label) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        })),
      };

      return {
        content: [
          {
            type: 'text',
            text: `Labels agregadas: ${output.addedLabels.map((l) => l.name).join(', ')}`,
          },
        ],
        structuredContent: output,
      };
    },
  };
};
