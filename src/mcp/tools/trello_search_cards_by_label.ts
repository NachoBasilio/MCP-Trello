import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { SearchCardsByLabelUseCase } from '../../application/search-cards-by-label.js';
import { isErr } from '../../shared/index.js';
import {
  trelloSearchCardsByLabelInputSchema,
  trelloSearchCardsByLabelInputSchemaBase,
  trelloSearchCardsByLabelOutputSchema,
} from '../../types/tool-contract.js';

export interface SearchCardsByLabelToolHandler {
  name: 'trello_search_cards_by_label';
  title: string;
  description: string;
  inputSchema: typeof trelloSearchCardsByLabelInputSchemaBase.shape;
  outputSchema: typeof trelloSearchCardsByLabelOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Tool MCP para buscar tarjetas dentro de una label reutilizando CardQueryVO.
 */
export const createSearchCardsByLabelTool = (
  useCase: SearchCardsByLabelUseCase
): SearchCardsByLabelToolHandler => {
  return {
    name: 'trello_search_cards_by_label',
    title: 'Buscar tarjetas dentro de una label',
    description: 'Aplica búsqueda por nombre dentro de una label específica del board.',
    inputSchema: trelloSearchCardsByLabelInputSchemaBase.shape,
    outputSchema: trelloSearchCardsByLabelOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = trelloSearchCardsByLabelInputSchema.parse(arguments_ ?? {});
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloSearchCardsByLabelOutputSchema.parse(result.value);

      return {
        content: [
          {
            type: 'text',
            text: formatSearchCardsByLabelText(output),
          },
        ],
        structuredContent: output,
      };
    },
  };
};

const formatSearchCardsByLabelText = (
  output: zod.infer<typeof trelloSearchCardsByLabelOutputSchema>
): string => {
  const lines = [
    `Busqueda "${output.query}" en label ${output.label.name}: ${output.cardCount} resultado(s)`,
  ];

  if (output.truncated) {
    lines.push('- resultados truncados por limit');
  }

  for (const card of output.cards) {
    lines.push(`- ${card.name} [${card.listName}] (${card.id})`);
  }

  return lines.join('\n');
};
