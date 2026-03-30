import type { DomainError } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface BoardSummaryInput {
  boardId?: string;
  boardName?: string;
}

export interface BoardSummaryOutput {
  boardId: string;
  listCount: number;
  cardCount: number;
  lists: { name: string; cardCount: number }[];
}

export interface BoardSummaryUseCase {
  execute(input: BoardSummaryInput): Promise<Result<BoardSummaryOutput, DomainError>>;
}

/**
 * Genera un resumen del board con conteo de tarjetas por lista.
 */
export const createBoardSummaryUseCase = (gateway: TrelloGateway): BoardSummaryUseCase => {
  return {
    execute: async (input: BoardSummaryInput): Promise<Result<BoardSummaryOutput, DomainError>> => {
      const boardIdResult = await gateway.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const listsResult = await gateway.listBoardLists(boardIdResult.value);
      const cardsResult = await gateway.listCards(boardIdResult.value);

      if (isErr(listsResult)) {
        return listsResult;
      }

      if (isErr(cardsResult)) {
        return cardsResult;
      }

      const lists = listsResult.value;
      const cards = cardsResult.value;

      const listCardCounts = new Map<string, number>();

      for (const card of cards) {
        const count = listCardCounts.get(card.idList) ?? 0;
        listCardCounts.set(card.idList, count + 1);
      }

      return {
        ok: true,
        value: {
          boardId: boardIdResult.value,
          listCount: lists.length,
          cardCount: cards.length,
          lists: lists.map((list) => ({
            name: list.name,
            cardCount: listCardCounts.get(list.id) ?? 0,
          })),
        },
      };
    },
  };
};
