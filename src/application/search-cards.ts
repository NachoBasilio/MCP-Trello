import { CardQueryVO, type CardSummary, type DomainError } from '../domain/index.js';
import { isErr, ok, type Result } from '../shared/index.js';

import type { TrelloSearchCardsPort } from './ports.js';

export interface SearchCardsInput {
  query: string;
  boardId?: string;
  limit?: number;
}

export interface SearchCardsOutput {
  boardId: string;
  cards: CardSummary[];
  truncated: boolean;
}

export interface SearchCardsUseCase {
  execute(input: SearchCardsInput): Promise<Result<SearchCardsOutput, DomainError>>;
}

/**
 * Ejecuta la busqueda read-only reutilizando la semantica del dominio `CardQueryVO`.
 */
export const createSearchCardsUseCase = (port: TrelloSearchCardsPort): SearchCardsUseCase => {
  return {
    execute: async (input: SearchCardsInput): Promise<Result<SearchCardsOutput, DomainError>> => {
      const query = CardQueryVO.create(input);
      const boardIdResult = await port.resolveBoardId(query.boardId);

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const cardsResult = await port.listCards(boardIdResult.value);

      if (isErr(cardsResult)) {
        return cardsResult;
      }

      const matchingCards = cardsResult.value.filter((card) => query.matchesCardName(card.name));
      const cards = matchingCards.slice(0, query.limit);

      return ok({
        boardId: boardIdResult.value,
        cards,
        truncated: matchingCards.length > cards.length,
      });
    },
  };
};
