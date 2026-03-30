import type { Board, CardSummary, Comment, DomainError } from '../domain/index.js';
import type { Result } from '../shared/index.js';

export interface TrelloSearchCardsPort {
  resolveBoardId(boardId?: string): Promise<Result<string, DomainError>>;
  listCards(boardId: string): Promise<Result<CardSummary[], DomainError>>;
}

export interface TrelloAddCommentPort extends TrelloSearchCardsPort {
  addComment(cardId: string, text: string): Promise<Result<Comment, DomainError>>;
}

/**
 * Puerto para listar boards accesibles y resolver un board por nombre normalizado.
 */
export interface TrelloBoardPort {
  /**
   * Lista todos los boards accesibles del miembro autenticado.
   */
  listBoards(): Promise<Result<Board[], DomainError>>;

  /**
   * Resuelve el board efectivo siguiendo la precedencia: boardId > boardName > default > auto-discovery.
   */
  resolveBoard(input: { boardId?: string; boardName?: string }): Promise<Result<string, DomainError>>;
}
