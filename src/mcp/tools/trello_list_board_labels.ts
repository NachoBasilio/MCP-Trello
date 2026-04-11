import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ListBoardLabelsUseCase } from '../../application/list-board-labels.js';
import { isErr } from '../../shared/index.js';
import {
  trelloListBoardLabelsInputSchema,
  trelloListBoardLabelsInputSchemaBase,
  trelloListBoardLabelsOutputSchema,
} from '../../types/tool-contract.js';

export interface ListBoardLabelsToolHandler {
  name: 'trello_list_board_labels';
  title: string;
  description: string;
  inputSchema: typeof trelloListBoardLabelsInputSchemaBase.shape;
  outputSchema: typeof trelloListBoardLabelsOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Tool MCP para listar todas las labels de un board especifico.
 */
export const createListBoardLabelsTool = (useCase: ListBoardLabelsUseCase): ListBoardLabelsToolHandler => {
  return {
    name: 'trello_list_board_labels',
    title: 'Listar labels del board',
    description: 'Devuelve todas las labels disponibles en el board seleccionado.',
    inputSchema: trelloListBoardLabelsInputSchemaBase.shape,
    outputSchema: trelloListBoardLabelsOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = trelloListBoardLabelsInputSchema.parse(arguments_ ?? {});
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloListBoardLabelsOutputSchema.parse(result.value);

      return {
        content: [
          {
            type: 'text',
            text: formatListBoardLabelsText(output),
          },
        ],
        structuredContent: output,
      };
    },
  };
};

const formatListBoardLabelsText = (
  output: zod.infer<typeof trelloListBoardLabelsOutputSchema>
): string => {
  const lines = [
    `Labels en board ${output.boardId}: ${output.labelCount}`,
  ];

  for (const label of output.labels) {
    lines.push(`- ${label.name} (${label.color})`);
  }

  return lines.join('\n');
};
