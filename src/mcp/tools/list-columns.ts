import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ListColumnsUseCase } from '../../application/list-columns.js';
import { isErr } from '../../shared/index.js';

export const listColumnsInputSchema = zod.object({
  boardId: zod.string().trim().min(1).optional(),
  boardName: zod.string().trim().min(1).optional(),
});

export const listColumnsOutputSchema = zod.object({
  boardId: zod.string(),
  columns: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
    })
  ),
});

export interface ListColumnsToolHandler {
  name: 'trello_list_columns';
  title: string;
  description: string;
  inputSchema: typeof listColumnsInputSchema.shape;
  outputSchema: typeof listColumnsOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Handler MCP para listar columnas (listas) de un board con sus IDs.
 */
export const createListColumnsTool = (useCase: ListColumnsUseCase): ListColumnsToolHandler => {
  return {
    name: 'trello_list_columns',
    title: 'Listar columnas de un board',
    description:
      'Lista columnas (listas) abiertas y cerradas de un board con nombre e ID para mover o eliminar tarjetas sin ambiguedad.',
    inputSchema: listColumnsInputSchema.shape,
    outputSchema: listColumnsOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = listColumnsInputSchema.parse(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = {
        boardId: result.value.boardId,
        columns: result.value.columns.map((list) => ({ id: list.id, name: list.name })),
      };

      const lines = output.columns.length
        ? output.columns.map((column) => `- ${column.name} (${column.id})`)
        : ['No se encontraron columnas en el board.'];

      return {
        content: [
          {
            type: 'text',
            text: [`Columnas del board ${output.boardId} (abiertas y cerradas):`, ...lines].join('\n'),
          },
        ],
        structuredContent: output,
      };
    },
  };
};
