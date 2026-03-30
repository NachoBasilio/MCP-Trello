import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ListBoardsUseCase } from '../../application/list-boards.js';
import { isErr } from '../../shared/index.js';
import { trelloListBoardsOutputSchema } from '../../types/tool-contract.js';

export interface ListBoardsToolHandler {
  name: 'trello_list_boards';
  title: string;
  description: string;
  outputSchema: typeof trelloListBoardsOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Crea la tool MCP para listar todos los boards accesibles del miembro autenticado.
 */
export const createListBoardsTool = (useCase: ListBoardsUseCase): ListBoardsToolHandler => {
  return {
    name: 'trello_list_boards',
    title: 'Listar boards de Trello',
    description:
      'Lista todos los boards accesibles del miembro autenticado, devolviendo nombre e ID para que el usuario pueda elegir el correcto.',
    outputSchema: trelloListBoardsOutputSchema.shape,
    execute: async (_arguments: unknown): Promise<CallToolResult> => {
      const result = await useCase.execute();

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloListBoardsOutputSchema.parse({
        boards: result.value.map((board) => ({
          id: board.id,
          name: board.name,
        })),
      });

      return {
        content: [
          {
            type: 'text',
            text: formatListBoardsText(output),
          },
        ],
        structuredContent: output,
      };
    },
  };
};

const formatListBoardsText = (output: zod.infer<typeof trelloListBoardsOutputSchema>): string => {
  if (output.boards.length === 0) {
    return 'No se encontraron boards accesibles.';
  }

  const lines = [`${output.boards.length} board(s) accesible(s):`];

  for (const board of output.boards) {
    lines.push(`- ${board.name} (${board.id})`);
  }

  return lines.join('\n');
};
