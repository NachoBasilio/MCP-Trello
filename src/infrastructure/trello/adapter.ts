import type { Config } from '../../config/index.js';
import {
  createBoardAmbiguousError,
  createBoardIdRequiredError,
  createBoardNotFoundError,
  type Board,
  type Card,
  type CardSummary,
  type Comment,
  type DomainError,
  type Label,
  type List,
} from '../../domain/index.js';
import { err, ok, type Result } from '../../shared/index.js';

import type { TrelloGateway } from '../../application/ports.js';
import { fetchMemberBoards } from './board-api.js';
import { fetchBoardCards, createTrelloCard, updateTrelloCard } from './card-api.js';
import { fetchBoardLists, createBoardList } from './list-api.js';
import { fetchBoardLabels, addLabelToCard, createBoardLabel } from './label-api.js';
import { postCardComment, fetchCardComments } from './comment-api.js';

type FetchLike = typeof fetch;

/**
 * Crea el adapter completo de Trello implementando el puerto TrelloGateway.
 */
export const createTrelloSearchCardsAdapter = (
  config: Config,
  fetchImplementation: FetchLike = fetch
): TrelloGateway => {
  return {
    resolveBoardId: async (boardId?: string): Promise<Result<string, DomainError>> => {
      const candidateBoardId = boardId?.trim() || config.TRELLO_DEFAULT_BOARD_ID?.trim();

      if (!candidateBoardId) {
        return err(createBoardIdRequiredError());
      }

      return ok(candidateBoardId);
    },

    listCards: async (boardId: string): Promise<Result<CardSummary[], DomainError>> => {
      return fetchBoardCards(config, boardId, fetchImplementation);
    },

    addComment: async (cardId: string, text: string): Promise<Result<Comment, DomainError>> => {
      return postCardComment(config, cardId, text, fetchImplementation);
    },

    listBoards: async (): Promise<Result<Board[], DomainError>> => {
      return fetchMemberBoards(config, 'me', fetchImplementation);
    },

    resolveBoard: async (input: {
      boardId?: string;
      boardName?: string;
    }): Promise<Result<string, DomainError>> => {
      const explicitBoardId = input.boardId?.trim();
      if (explicitBoardId) {
        return ok(explicitBoardId);
      }

      if (input.boardName) {
        const boardsResult = await fetchMemberBoards(config, 'me', fetchImplementation);

        if (!boardsResult.ok) {
          return boardsResult;
        }

        const normalizedName = normalizeBoardName(input.boardName);
        const matches: Board[] = [];

        for (const board of boardsResult.value) {
          if (normalizeBoardName(board.name) === normalizedName) {
            matches.push(board);
          }
        }

        if (matches.length === 0) {
          return err(createBoardNotFoundError());
        }

        if (matches.length > 1) {
          return err(
            createBoardAmbiguousError(
              matches.map((board) => ({ id: board.id, name: board.name })),
              input.boardName
            )
          );
        }

        return ok(matches[0].id);
      }

      const defaultBoardId = config.TRELLO_DEFAULT_BOARD_ID?.trim();
      if (defaultBoardId) {
        return ok(defaultBoardId);
      }

      const boardsResult = await fetchMemberBoards(config, 'me', fetchImplementation);

      if (!boardsResult.ok) {
        return boardsResult;
      }

      if (boardsResult.value.length === 1) {
        return ok(boardsResult.value[0].id);
      }

      return err(createBoardIdRequiredError());
    },

    listBoardLists: async (boardId: string): Promise<Result<List[], DomainError>> => {
      return fetchBoardLists(config, boardId, fetchImplementation);
    },

    createList: async (boardId: string, name: string): Promise<Result<List, DomainError>> => {
      return createBoardList(config, boardId, name, fetchImplementation);
    },

    createCard: async (input: {
      name: string;
      idList: string;
      description?: string;
      pos?: string;
    }): Promise<Result<Card, DomainError>> => {
      return createTrelloCard(config, input, fetchImplementation);
    },

    updateCard: async (
      cardId: string,
      input: {
        idList?: string;
        name?: string;
        desc?: string;
        due?: string | null;
        pos?: string;
        closed?: boolean;
      }
    ): Promise<Result<Card, DomainError>> => {
      return updateTrelloCard(config, cardId, input, fetchImplementation);
    },

    listBoardLabels: async (boardId: string): Promise<Result<Label[], DomainError>> => {
      return fetchBoardLabels(config, boardId, fetchImplementation);
    },

    addLabel: async (cardId: string, labelId: string): Promise<Result<void, DomainError>> => {
      return addLabelToCard(config, cardId, labelId, fetchImplementation);
    },

    createLabel: async (
      boardId: string,
      name: string,
      color: string
    ): Promise<Result<Label, DomainError>> => {
      return createBoardLabel(config, boardId, name, color, fetchImplementation);
    },

    listCardComments: async (cardId: string): Promise<Result<Comment[], DomainError>> => {
      return fetchCardComments(config, cardId, fetchImplementation);
    },
  };
};

const normalizeBoardName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
};
