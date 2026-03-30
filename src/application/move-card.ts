import {
  createCardAmbiguousError,
  createCardNotFoundError,
  type Card,
  type DomainError,
} from '../domain/index.js';
import { CardQueryVO } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface MoveCardInput {
  cardName?: string;
  cardId?: string;
  toList: string;
  boardId?: string;
  boardName?: string;
}

export interface MoveCardUseCase {
  execute(input: MoveCardInput): Promise<Result<Card, DomainError>>;
}

/**
 * Mueve tarjetas entre listas, con soporte para resolucion por nombre y desambiguacion.
 */
export const createMoveCardUseCase = (gateway: TrelloGateway): MoveCardUseCase => {
  return {
    execute: async (input: MoveCardInput): Promise<Result<Card, DomainError>> => {
      let targetCardId: string;

      if (input.cardId) {
        targetCardId = input.cardId;
      } else {
        const boardIdResult = await gateway.resolveBoard({
          boardId: input.boardId,
          boardName: input.boardName,
        });

        if (isErr(boardIdResult)) {
          return boardIdResult;
        }

        const cardsResult = await gateway.listCards(boardIdResult.value);

        if (isErr(cardsResult)) {
          return cardsResult;
        }

        const query = CardQueryVO.create({ query: input.cardName ?? '' });
        const matches = cardsResult.value.filter((card) => query.matchesCardName(card.name));

        if (matches.length === 0) {
          return { ok: false, error: createCardNotFoundError(input.cardName ?? '') };
        }

        if (matches.length > 1) {
          return {
            ok: false,
            error: createCardAmbiguousError(
              matches.map((card) => ({
                id: card.id,
                name: card.name,
                idList: card.idList,
              })),
              input.cardName ?? ''
            ),
          };
        }

        targetCardId = matches[0].id;
      }

      const boardIdResult = await gateway.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const listsResult = await gateway.listBoardLists(boardIdResult.value);

      if (isErr(listsResult)) {
        return listsResult;
      }

      let targetList = listsResult.value.find(
        (list) => list.name.toLowerCase() === input.toList.toLowerCase()
      );

      if (!targetList) {
        const createListResult = await gateway.createList(boardIdResult.value, input.toList);

        if (isErr(createListResult)) {
          return createListResult;
        }

        targetList = createListResult.value;
      }

      return gateway.updateCard(targetCardId, { idList: targetList.id });
    },
  };
};
