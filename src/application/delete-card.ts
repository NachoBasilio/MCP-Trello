import type { CardSummary, DomainError } from '../domain/index.js';
import { CardQueryVO, createCardAmbiguousError, createCardNotFoundError } from '../domain/index.js';
import { isErr, type Result } from '../shared/index.js';

import type { TrelloGateway } from './ports.js';

export interface DeleteCardInput {
  cardId?: string;
  cardName?: string;
  boardId?: string;
  boardName?: string;
}

export interface DeleteCardOutput {
  id: string;
  name?: string;
}

export interface DeleteCardUseCase {
  execute(input: DeleteCardInput): Promise<Result<DeleteCardOutput, DomainError>>;
}

/**
 * Elimina tarjetas de Trello usando cardId directo o resolviendo por nombre con desambiguacion.
 */
export const createDeleteCardUseCase = (gateway: TrelloGateway): DeleteCardUseCase => {
  return {
    execute: async (input: DeleteCardInput): Promise<Result<DeleteCardOutput, DomainError>> => {
      let targetCardId: string;
      let targetCardName: string | undefined;

      if (input.cardId) {
        targetCardId = input.cardId;
        targetCardName = undefined;
      } else {
        if (!input.cardName) {
          return { ok: false, error: createCardNotFoundError('') };
        }

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

        const query = CardQueryVO.create({ query: input.cardName });
        const matches = cardsResult.value.filter((card) => query.matchesCardName(card.name));

        if (matches.length === 0) {
          return { ok: false, error: createCardNotFoundError(input.cardName) };
        }

        if (matches.length > 1) {
          return {
            ok: false,
            error: createCardAmbiguousError(
              matches.map((card: CardSummary) => ({
                id: card.id,
                name: card.name,
                idList: card.idList,
              })),
              input.cardName
            ),
          };
        }

        targetCardId = matches[0].id;
        targetCardName = matches[0].name;
      }

      const deleteResult = await gateway.deleteCard(targetCardId);

      if (isErr(deleteResult)) {
        return deleteResult;
      }

      return {
        ok: true,
        value: {
          id: targetCardId,
          name: targetCardName,
        },
      };
    },
  };
};
