import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

import type { BoardByLabelUseCase } from '../../application/board-by-label.js';
import { isErr } from '../../shared/index.js';

export const boardByLabelTemplate = new ResourceTemplate('trello://boards/{boardId}/by-label/{labelName}', {
  list: undefined,
});

/**
 * Handler MCP para el resource de tarjetas filtradas por label.
 */
export const createBoardByLabelResource = (useCase: BoardByLabelUseCase) => {
  return {
    name: 'board-by-label' as const,
    template: boardByLabelTemplate,
    metadata: {
      title: 'Tarjetas por Label del Board',
      description: 'Filtra las tarjetas de un board por un label específico.',
      mimeType: 'application/json',
    },
    read: async (uri: URL, variables: Record<string, string | string[]>): Promise<ReadResourceResult> => {
      const boardId = variables.boardId as string;
      const labelName = variables.labelName as string;
      const result = await useCase.execute({ boardId, labelName });

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
