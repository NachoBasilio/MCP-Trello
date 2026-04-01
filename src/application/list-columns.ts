import type { DomainError, List } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface ListColumnsInput {
  boardId?: string;
  boardName?: string;
}

export interface ListColumnsUseCase {
  execute(input: ListColumnsInput): Promise<Result<{ boardId: string; columns: List[] }, DomainError>>;
}

/**
 * Lista las columnas (listas) de un board para poder operar con IDs sin ambiguedad.
 */
export const createListColumnsUseCase = (gateway: TrelloGateway): ListColumnsUseCase => {
  return {
    execute: async (
      input: ListColumnsInput
    ): Promise<Result<{ boardId: string; columns: List[] }, DomainError>> => {
      const boardIdResult = await gateway.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const columnsResult = await gateway.listBoardLists(boardIdResult.value, {
        includeClosed: true,
      });

      if (isErr(columnsResult)) {
        return columnsResult;
      }

      return {
        ok: true,
        value: {
          boardId: boardIdResult.value,
          columns: columnsResult.value,
        },
      };
    },
  };
};
