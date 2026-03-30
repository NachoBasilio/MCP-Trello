import type { CardSummary, DomainError } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface BoardOverdueInput {
  boardId?: string;
  boardName?: string;
}

export interface BoardOverdueOutput {
  boardId: string;
  overdueCards: CardSummary[];
  overdueCount: number;
}

export interface BoardOverdueUseCase {
  execute(input: BoardOverdueInput): Promise<Result<BoardOverdueOutput, DomainError>>;
}

/**
 * Lista tarjetas vencidas del board (con fecha de vencimiento pasada).
 */
export const createBoardOverdueUseCase = (gateway: TrelloGateway): BoardOverdueUseCase => {
  return {
    execute: async (input: BoardOverdueInput): Promise<Result<BoardOverdueOutput, DomainError>> => {
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

      const now = new Date();
      const overdueCards = cardsResult.value.filter((card) => {
        if (!card.due) return false;
        return new Date(card.due) < now && !card.closed;
      });

      return {
        ok: true,
        value: {
          boardId: boardIdResult.value,
          overdueCards,
          overdueCount: overdueCards.length,
        },
      };
    },
  };
};
