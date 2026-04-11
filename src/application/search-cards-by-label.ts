import { CardQueryVO, type CardSummary, type DomainError } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { ListLabelCardsInput, ListLabelCardsOutput, ListLabelCardsUseCase } from './list-label-cards.js';

export interface SearchCardsByLabelInput extends Omit<ListLabelCardsInput, 'limit'> {
  query: string;
  limit?: number;
}

export interface SearchCardsByLabelOutput extends ListLabelCardsOutput {
  query: string;
}

export interface SearchCardsByLabelUseCase {
  execute(input: SearchCardsByLabelInput): Promise<Result<SearchCardsByLabelOutput, DomainError>>;
}

const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 1;
const MAX_LIMIT = 25;

/**
 * Busca tarjetas dentro de una label reutilizando la semantica de CardQueryVO.
 */
export const createSearchCardsByLabelUseCase = (
  listLabelCards: ListLabelCardsUseCase
): SearchCardsByLabelUseCase => {
  return {
    execute: async (input: SearchCardsByLabelInput): Promise<Result<SearchCardsByLabelOutput, DomainError>> => {
      const normalizedLimit = clampLimit(input.limit);
      const query = CardQueryVO.create({ query: input.query, limit: normalizedLimit });
      const labelCardsResult = await listLabelCards.execute({
        boardId: input.boardId,
        boardName: input.boardName,
        labelId: input.labelId,
        labelName: input.labelName,
        limit: MAX_LIMIT,
      });

      if (isErr(labelCardsResult)) {
        return labelCardsResult;
      }

      const matchingCards = filterCards(labelCardsResult.value.cards, query);
      const cards = matchingCards.slice(0, normalizedLimit);
      const truncated = labelCardsResult.value.truncated || matchingCards.length > cards.length;

      return {
        ok: true,
        value: {
          boardId: labelCardsResult.value.boardId,
          label: labelCardsResult.value.label,
          cards,
          cardCount: cards.length,
          truncated,
          query: input.query,
        },
      };
    },
  };
};

const filterCards = (cards: CardSummary[], query: CardQueryVO): CardSummary[] => {
  return cards.filter((card) => query.matchesCardName(card.name));
};

const clampLimit = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, Math.trunc(value)));
};
