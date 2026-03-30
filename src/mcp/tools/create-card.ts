import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { CreateCardUseCase } from '../../application/create-card.js';
import { isErr } from '../../shared/index.js';

export const createCardInputSchema = zod.object({
  name: zod.string().trim().min(1, 'Card name cannot be empty'),
  listName: zod.string().trim().min(1).optional(),
  boardId: zod.string().trim().min(1).optional(),
  boardName: zod.string().trim().min(1).optional(),
  description: zod.string().optional(),
  pos: zod.enum(['top', 'bottom']).optional(),
});

export const createCardOutputSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  listId: zod.string(),
  boardId: zod.string(),
  url: zod.string(),
});

export interface CreateCardToolHandler {
  name: 'trello_create_card';
  title: string;
  description: string;
  inputSchema: typeof createCardInputSchema.shape;
  outputSchema: typeof createCardOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Handler MCP para crear tarjetas en Trello.
 */
export const createCreateCardTool = (useCase: CreateCardUseCase): CreateCardToolHandler => {
  return {
    name: 'trello_create_card',
    title: 'Crear tarjeta en Trello',
    description:
      'Crea una nueva tarjeta en un board de Trello, creando la lista implicitamente si no existe.',
    inputSchema: createCardInputSchema.shape,
    outputSchema: createCardOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = createCardInputSchema.parse(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = {
        id: result.value.id,
        name: result.value.name,
        listId: result.value.listId,
        boardId: result.value.boardId,
        url: result.value.url,
      };

      return {
        content: [
          {
            type: 'text',
            text: `Tarjeta creada: ${output.name} (${output.id})\n${output.url}`,
          },
        ],
        structuredContent: output,
      };
    },
  };
};
