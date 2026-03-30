import type { CardSummary, DomainError } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface BoardByLabelInput {
  boardId?: string;
  boardName?: string;
  labelName: string;
}

export interface BoardByLabelOutput {
  boardId: string;
  labelName: string;
  matchingCards: CardSummary[];
  cardCount: number;
}

export interface BoardByLabelUseCase {
  execute(input: BoardByLabelInput): Promise<Result<BoardByLabelOutput, DomainError>>;
}

/**
 * Filtra tarjetas del board por label.
 */
export const createBoardByLabelUseCase = (gateway: TrelloGateway): BoardByLabelUseCase => {
  return {
    execute: async (input: BoardByLabelInput): Promise<Result<BoardByLabelOutput, DomainError>> => {
      const boardIdResult = await gateway.resolveBoard({
        boardId: input.boardId,
        boardName: input.boardName,
      });

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const labelsResult = await gateway.listBoardLabels(boardIdResult.value);

      if (isErr(labelsResult)) {
        return labelsResult;
      }

      const targetLabel = labelsResult.value.find(
        (label) => label.name.toLowerCase() === input.labelName.toLowerCase()
      );

      if (!targetLabel) {
        return {
          ok: true,
          value: {
            boardId: boardIdResult.value,
            labelName: input.labelName,
            matchingCards: [],
            cardCount: 0,
          },
        };
      }

      const cardsResult = await gateway.listCards(boardIdResult.value);

      if (isErr(cardsResult)) {
        return cardsResult;
      }

      const matchingCards = cardsResult.value.filter((card) =>
        card.listName !== undefined
      );

      return {
        ok: true,
        value: {
          boardId: boardIdResult.value,
          labelName: input.labelName,
          matchingCards,
          cardCount: matchingCards.length,
        },
      };
    },
  };
};
