import type { Board, Card, CardSummary, Comment, DomainError, Label, List } from '../domain/index.js';
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
  listBoards(): Promise<Result<Board[], DomainError>>;
  resolveBoard(input: { boardId?: string; boardName?: string }): Promise<Result<string, DomainError>>;
}

/**
 * Puerto completo de Trello para operaciones CRUD y consultas de board.
 */
export interface TrelloGateway extends TrelloBoardPort {
  resolveBoardId(boardId?: string): Promise<Result<string, DomainError>>;
  listCards(boardId: string): Promise<Result<CardSummary[], DomainError>>;
  addComment(cardId: string, text: string): Promise<Result<Comment, DomainError>>;

  listBoardLists(
    boardId: string,
    options?: {
      includeClosed?: boolean;
    }
  ): Promise<Result<List[], DomainError>>;
  createList(boardId: string, name: string): Promise<Result<List, DomainError>>;

  createCard(input: {
    name: string;
    idList: string;
    description?: string;
    pos?: string;
  }): Promise<Result<Card, DomainError>>;

  updateCard(cardId: string, input: {
    idList?: string;
    name?: string;
    desc?: string;
    due?: string | null;
    pos?: string;
    closed?: boolean;
  }): Promise<Result<Card, DomainError>>;

  deleteCard(cardId: string): Promise<Result<void, DomainError>>;

  listBoardLabels(boardId: string): Promise<Result<Label[], DomainError>>;
  addLabel(cardId: string, labelId: string): Promise<Result<void, DomainError>>;
  createLabel(boardId: string, name: string, color: string): Promise<Result<Label, DomainError>>;

  listCardComments(cardId: string): Promise<Result<Comment[], DomainError>>;
}
