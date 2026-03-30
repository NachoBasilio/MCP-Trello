import {
  CardQueryVO,
  createCardAmbiguousError,
  createCardNotFoundError,
  createCommentEmptyError,
  type Comment,
  type DomainError,
} from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloAddCommentPort } from './ports.js';

export interface AddCommentInput {
  cardId?: string;
  cardName?: string;
  boardId?: string;
  text: string;
}

export interface AddCommentUseCase {
  execute(input: AddCommentInput): Promise<Result<Comment, DomainError>>;
}

/**
 * Agrega comentarios a una tarjeta reutilizando `CardQueryVO` solo cuando hace falta resolver `cardName`.
 */
export const createAddCommentUseCase = (port: TrelloAddCommentPort): AddCommentUseCase => {
  return {
    execute: async (input: AddCommentInput): Promise<Result<Comment, DomainError>> => {
      if (input.text.trim().length === 0) {
        return { ok: false, error: createCommentEmptyError() };
      }

      const targetCardId = input.cardId?.trim();

      if (targetCardId) {
        return port.addComment(targetCardId, input.text);
      }

      const query = CardQueryVO.create({
        query: input.cardName ?? '',
        boardId: input.boardId,
      });
      const boardIdResult = await port.resolveBoardId(query.boardId);

      if (isErr(boardIdResult)) {
        return boardIdResult;
      }

      const cardsResult = await port.listCards(boardIdResult.value);

      if (isErr(cardsResult)) {
        return cardsResult;
      }

      const matches = cardsResult.value.filter((card) => query.matchesCardName(card.name));

      if (matches.length === 0) {
        return { ok: false, error: createCardNotFoundError(query.query) };
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
            query.query
          ),
        };
      }

      return port.addComment(matches[0].id, input.text);
    },
  };
};
