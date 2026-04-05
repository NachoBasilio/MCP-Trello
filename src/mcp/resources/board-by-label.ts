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
      const boardId = typeof variables.boardId === 'string' ? variables.boardId : undefined;
      const labelName = variables.labelName as string;
      const boardName = extractBoardName(uri);
      const limitParam = uri.searchParams.get('limit');
      const limit = typeof limitParam === 'string' ? Number.parseInt(limitParam, 10) : undefined;
      const result = await useCase.execute({ boardId, boardName, labelName, limit });

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

const extractBoardName = (uri: URL): string | undefined => {
  const boardNameParam = uri.searchParams.get('boardName');

  if (typeof boardNameParam === 'string' && boardNameParam.trim().length > 0) {
    return boardNameParam;
  }

  return undefined;
};
