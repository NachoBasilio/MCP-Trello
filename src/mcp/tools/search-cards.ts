import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { SearchCardsUseCase } from '../../application/search-cards.js';
import { isErr } from '../../shared/index.js';
import {
  trelloSearchCardsInputSchema,
  trelloSearchCardsOutputSchema,
  type TrelloSearchCardsInput,
} from '../../types/tool-contract.js';

export interface SearchCardsToolHandler {
  name: 'trello_search_cards';
  title: string;
  description: string;
  inputSchema: typeof trelloSearchCardsInputSchema.shape;
  outputSchema: typeof trelloSearchCardsOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Crea la tool MCP de busqueda read-only sin acoplarla al transporte ni a Trello HTTP.
 */
export const createSearchCardsTool = (useCase: SearchCardsUseCase): SearchCardsToolHandler => {
  return {
    name: 'trello_search_cards',
    title: 'Buscar tarjetas de Trello',
    description:
      'Busca tarjetas por nombre usando substrings case-insensitive con logica AND entre terminos, sin exponer otras capacidades Trello todavia.',
    inputSchema: trelloSearchCardsInputSchema.shape,
    outputSchema: trelloSearchCardsOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = parseSearchCardsInput(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = trelloSearchCardsOutputSchema.parse({
        boardId: result.value.boardId,
        truncated: result.value.truncated,
        cards: result.value.cards.map((card) => ({
          id: card.id,
          name: card.name,
          idList: card.idList,
          listName: card.listName ?? 'Unknown list',
          boardId: card.boardId,
          closed: card.closed,
          shortUrl: card.shortUrl,
          due: card.due ?? null,
        })),
      });

      return {
        content: [
          {
            type: 'text',
            text: formatSearchCardsText(output),
          },
        ],
        structuredContent: output,
      };
    },
  };
};

const parseSearchCardsInput = (arguments_: unknown): TrelloSearchCardsInput => {
  const parsed = trelloSearchCardsInputSchema.safeParse(arguments_ ?? {});

  if (parsed.success) {
    return parsed.data;
  }

  throw parsed.error;
};

const formatSearchCardsText = (output: zod.infer<typeof trelloSearchCardsOutputSchema>): string => {
  const lines = [`Search results on board ${output.boardId}: ${output.cards.length} card(s)`];

  if (output.truncated) {
    lines.push('- results were truncated by limit');
  }

  for (const card of output.cards) {
    lines.push(`- ${card.name} [${card.listName}] (${card.id})`);
  }

  return lines.join('\n');
};
