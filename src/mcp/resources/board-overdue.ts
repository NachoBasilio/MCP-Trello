import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import type { BoardOverdueUseCase } from '../../application/board-overdue.js';
import { isErr } from '../../shared/index.js';

export const boardOverdueTemplate = new ResourceTemplate('trello://boards/{boardId}/overdue', {
  list: undefined,
});

/**
 * Handler MCP para el resource de tarjetas vencidas del board.
 */
export const createBoardOverdueResource = (useCase: BoardOverdueUseCase) => {
  return {
    name: 'board-overdue' as const,
    template: boardOverdueTemplate,
    metadata: {
      title: 'Tarjetas Vencidas del Board',
      description: 'Lista las tarjetas con fecha de vencimiento pasada en un board específico.',
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
