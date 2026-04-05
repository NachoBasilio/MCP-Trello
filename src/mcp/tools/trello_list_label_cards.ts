import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { ListLabelCardsUseCase } from '../../application/list-label-cards.js';
import { isErr } from '../../shared/index.js';
import {
  trelloListLabelCardsInputSchema,
  trelloListLabelCardsInputSchemaBase,
  trelloListLabelCardsOutputSchema,
} from '../../types/tool-contract.js';

export interface ListLabelCardsToolHandler {
  name: 'trello_list_label_cards';
  title: string;
  description: string;
  inputSchema: typeof trelloListLabelCardsInputSchemaBase.shape;
  outputSchema: typeof trelloListLabelCardsOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Tool MCP para listar tarjetas asociadas a una label en un board.
 */
export const createListLabelCardsTool = (useCase: ListLabelCardsUseCase): ListLabelCardsToolHandler => {
  return {
    name: 'trello_list_label_cards',
    title: 'Listar tarjetas de una label',
    description:
      'Devuelve las tarjetas asociadas a una label del board, respetando límites y señalando truncado cuando corresponde.',
    inputSchema: trelloListLabelCardsInputSchemaBase.shape,
    outputSchema: trelloListLabelCardsOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = trelloListLabelCardsInputSchema.parse(arguments_ ?? {});
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloListLabelCardsOutputSchema.parse(result.value);

      return {
        content: [
          {
            type: 'text',
            text: formatListLabelCardsText(output),
          },
        ],
        structuredContent: output,
      };
    },
  };
};

const formatListLabelCardsText = (
  output: zod.infer<typeof trelloListLabelCardsOutputSchema>
): string => {
  const lines = [
    `Label ${output.label.name} (${output.label.id}) tiene ${output.cardCount} tarjeta(s) expuestas`,
  ];

  if (output.truncated) {
    lines.push('- resultados truncados por limite');
  }

  for (const card of output.cards) {
    lines.push(`- ${card.name} [${card.listName}] (${card.id})`);
  }

  return lines.join('\n');
};
