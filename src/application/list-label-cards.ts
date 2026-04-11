import type { CardSummary, DomainError, Label } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloLabelPort } from './ports.js';
import type { ResolveLabelUseCase } from './resolve-label.js';

export interface ListLabelCardsInput {
  boardId?: string;
  boardName?: string;
  labelId?: string;
  labelName?: string;
  limit?: number;
}

export interface ListLabelCardsOutput {
  boardId: string;
  label: Label;
  cards: CardSummary[];
  cardCount: number;
  truncated: boolean;
}

export interface ListLabelCardsUseCase {
  execute(input: ListLabelCardsInput): Promise<Result<ListLabelCardsOutput, DomainError>>;
}

const DEFAULT_LIMIT = 50;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

/**
 * Lista tarjetas asociadas a una label resolviendo board y label previamente.
 */
export const createListLabelCardsUseCase = (
  port: TrelloLabelPort,
  resolveLabel: ResolveLabelUseCase
): ListLabelCardsUseCase => {
  return {
    execute: async (input: ListLabelCardsInput): Promise<Result<ListLabelCardsOutput, DomainError>> => {
      const normalizedLimit = clampLimit(input.limit);
      const resolvedLabel = await resolveLabel.execute({
        boardId: input.boardId,
        boardName: input.boardName,
        labelId: input.labelId,
        labelName: input.labelName,
      });

      if (isErr(resolvedLabel)) {
        return resolvedLabel;
      }

      const cardsResult = await port.listLabelCards({
        boardId: resolvedLabel.value.boardId,
        labelId: resolvedLabel.value.label.id,
        limit: Math.min(normalizedLimit + 1, MAX_LIMIT),
      });

      if (isErr(cardsResult)) {
        return cardsResult;
      }

      const cards = cardsResult.value.slice(0, normalizedLimit);

      return {
        ok: true,
        value: {
          boardId: resolvedLabel.value.boardId,
          label: resolvedLabel.value.label,
          cards,
          cardCount: cards.length,
          truncated: cardsResult.value.length > normalizedLimit,
        },
      };
    },
  };
};

const clampLimit = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, Math.trunc(value)));
};
