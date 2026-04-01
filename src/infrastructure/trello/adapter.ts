/**
 * Crea el adapter completo de Trello implementando el puerto TrelloGateway.
 * Maneja resolucion de board con precedence deterministica y soporte para reintentos.
 */

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
import { fetchBoardCards, createTrelloCard, updateTrelloCard, deleteTrelloCard } from './card-api.js';
import { fetchBoardLists, createBoardList } from './list-api.js';
import { fetchBoardLabels, addLabelToCard, createBoardLabel, updateBoardLabelColor } from './label-api.js';
import { postCardComment, fetchCardComments } from './comment-api.js';
import { createFetchWithRetry } from './retry.js';

/**
 * Normaliza un nombre de board para comparacion case-insensitive y collapse de whitespace.
 * @param name - Nombre original del board.
 * @returns Nombre normalizado (trim, lowercase, espacios multiples reducidos a uno).
 */
export const normalizeBoardName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
};

/**
 * Resuelve un board ID usando la precedencia: boardId > boardName > default > autodiscovery.
 * @param config - Configuracion con TRELLO_DEFAULT_BOARD_ID.
 * @param input - Input con boardId y/o boardName opcional.
 * @param boards - Lista de boards accesibles del miembro.
 * @returns Result con el board ID resuelto o error de dominio.
 */
const resolveBoardPrecedence = (
  config: Config,
  input: { boardId?: string; boardName?: string },
  boards: Board[]
): Result<string, DomainError> => {
  const explicitBoardId = input.boardId?.trim();
  if (explicitBoardId) {
    return ok(explicitBoardId);
  }

  if (input.boardName) {
    const normalizedInputName = normalizeBoardName(input.boardName);
    const matches: Board[] = [];

    for (const board of boards) {
      if (normalizeBoardName(board.name) === normalizedInputName) {
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

  if (boards.length === 1) {
    return ok(boards[0].id);
  }

  return err(createBoardIdRequiredError());
};

/**
 * Crea el adapter completo de Trello implementando el puerto TrelloGateway.
 * Usa createFetchWithRetry para envolver todas las llamadas HTTP con reintentos automaticos.
 */
export const createTrelloSearchCardsAdapter = (
  config: Config,
  fetchImplementation: typeof fetch = fetch
): TrelloGateway => {
  const fetchWithRetry = createFetchWithRetry(fetchImplementation);

  return {
    resolveBoardId: async (boardId?: string): Promise<Result<string, DomainError>> => {
      const candidateBoardId = boardId?.trim() || config.TRELLO_DEFAULT_BOARD_ID?.trim();

      if (!candidateBoardId) {
        return err(createBoardIdRequiredError());
      }

      return ok(candidateBoardId);
    },

    listCards: async (boardId: string): Promise<Result<CardSummary[], DomainError>> => {
      return fetchBoardCards(config, boardId, fetchWithRetry);
    },

    addComment: async (cardId: string, text: string): Promise<Result<Comment, DomainError>> => {
      return postCardComment(config, cardId, text, fetchWithRetry);
    },

    listBoards: async (): Promise<Result<Board[], DomainError>> => {
      return fetchMemberBoards(config, 'me', fetchWithRetry);
    },

    resolveBoard: async (input: {
      boardId?: string;
      boardName?: string;
    }): Promise<Result<string, DomainError>> => {
      const explicitBoardId = input.boardId?.trim();
      if (explicitBoardId) {
        return ok(explicitBoardId);
      }

      const boardsResult = await fetchMemberBoards(config, 'me', fetchWithRetry);

      if (!boardsResult.ok) {
        return boardsResult;
      }

      return resolveBoardPrecedence(config, input, boardsResult.value);
    },

    listBoardLists: async (
      boardId: string,
      options?: {
        includeClosed?: boolean;
      }
    ): Promise<Result<List[], DomainError>> => {
      return fetchBoardLists(config, boardId, options, fetchWithRetry);
    },

    createList: async (boardId: string, name: string): Promise<Result<List, DomainError>> => {
      return createBoardList(config, boardId, name, fetchWithRetry);
    },

    createCard: async (input: {
      name: string;
      idList: string;
      description?: string;
      pos?: string;
    }): Promise<Result<Card, DomainError>> => {
      return createTrelloCard(config, input, fetchWithRetry);
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
      return updateTrelloCard(config, cardId, input, fetchWithRetry);
    },

    listBoardLabels: async (boardId: string): Promise<Result<Label[], DomainError>> => {
      return fetchBoardLabels(config, boardId, fetchWithRetry);
    },

    addLabel: async (cardId: string, labelId: string): Promise<Result<void, DomainError>> => {
      return addLabelToCard(config, cardId, labelId, fetchWithRetry);
    },

    createLabel: async (
      boardId: string,
      name: string,
      color: string
    ): Promise<Result<Label, DomainError>> => {
      return createBoardLabel(config, boardId, name, color, fetchWithRetry);
    },

    updateLabelColor: async (labelId: string, color: string): Promise<Result<Label, DomainError>> => {
      return updateBoardLabelColor(config, labelId, color, fetchWithRetry);
    },

    listCardComments: async (cardId: string): Promise<Result<Comment[], DomainError>> => {
      return fetchCardComments(config, cardId, fetchWithRetry);
    },

    deleteCard: async (cardId: string): Promise<Result<void, DomainError>> => {
      return deleteTrelloCard(config, cardId, fetchWithRetry);
    },
  };
};
