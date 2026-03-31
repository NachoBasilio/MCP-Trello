import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import type { BoardSummaryUseCase } from '../../application/board-summary.js';
import { isErr } from '../../shared/index.js';

export const boardSummaryTemplate = new ResourceTemplate('trello://boards/{boardId}/summary', {
  list: undefined,
});

/**
 * Handler MCP para el resource de resumen de board.
 */
export const createBoardSummaryResource = (useCase: BoardSummaryUseCase) => {
  return {
    name: 'board-summary' as const,
    template: boardSummaryTemplate,
    metadata: {
      title: 'Resumen de Board de Trello',
      description: 'Expone el conteo de tarjetas por lista en un board específico.',
      mimeType: 'application/json',
    },
    read: async (uri: URL, variables: Record<string, string | string[]>): Promise<ReadResourceResult> => {
      const boardId = variables.boardId as string;
      const result = await useCase.execute({ boardId });

      if (isErr(result)) {
        throw result.error;
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(result.value, null, 2),
          },
        ],
      };
    },
  };
};
