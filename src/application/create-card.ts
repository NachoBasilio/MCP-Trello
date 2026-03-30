import type { Card, DomainError } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface CreateCardInput {
  name: string;
  listName?: string;
  boardId?: string;
  boardName?: string;
  description?: string;
  pos?: 'top' | 'bottom';
}

export interface CreateCardUseCase {
  execute(input: CreateCardInput): Promise<Result<Card, DomainError>>;
}

/**
 * Crea tarjetas en Trello, creando la lista implicitamente si no existe.
 */
export const createCreateCardUseCase = (gateway: TrelloGateway): CreateCardUseCase => {
  return {
    execute: async (input: CreateCardInput): Promise<Result<Card, DomainError>> => {
      const boardIdResult = await gateway.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const targetListName = input.listName ?? 'To Do';
      const listsResult = await gateway.listBoardLists(boardIdResult.value);

      if (isErr(listsResult)) {
        return listsResult;
      }

      let targetList = listsResult.value.find(
        (list) => list.name.toLowerCase() === targetListName.toLowerCase()
      );

      if (!targetList) {
        const createListResult = await gateway.createList(boardIdResult.value, targetListName);

        if (isErr(createListResult)) {
          return createListResult;
        }

        targetList = createListResult.value;
      }

      return gateway.createCard({
        name: input.name,
        idList: targetList.id,
        description: input.description,
        pos: input.pos,
      });
    },
  };
};
