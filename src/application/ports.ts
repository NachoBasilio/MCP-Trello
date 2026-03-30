import type { CardSummary, Comment, DomainError } from '../domain/index.js';
import type { Result } from '../shared/index.js';

export interface TrelloSearchCardsPort {
  resolveBoardId(boardId?: string): Promise<Result<string, DomainError>>;
  listCards(boardId: string): Promise<Result<CardSummary[], DomainError>>;
}

export interface TrelloAddCommentPort extends TrelloSearchCardsPort {
  addComment(cardId: string, text: string): Promise<Result<Comment, DomainError>>;
}
