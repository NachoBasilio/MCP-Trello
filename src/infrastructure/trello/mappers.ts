import type { Card, CardSummary, Comment, Label, List } from '../../domain/index.js';
import { createCard, createComment, createLabel, createList } from '../../domain/index.js';

/**
 * Mappers de payloads crudos de Trello a entidades del dominio.
 */

interface TrelloCardPayload {
  id: string;
  name: string;
  idList: string;
  idBoard: string;
  desc?: string;
  closed: boolean;
  shortUrl: string;
  due?: string | null;
  idLabels?: string[];
  pos?: number;
}

interface TrelloListPayload {
  id: string;
  name: string;
  idBoard?: string;
}

interface TrelloLabelPayload {
  id: string;
  name: string;
  color: string;
}

interface TrelloCommentPayload {
  id: string;
  date: string;
  data: { text: string };
  memberCreator?: { fullName?: string; username?: string };
}

/**
 * Mapea un payload crudo de Trello a CardSummary interno.
 */
export const mapToCardSummary = (
  card: TrelloCardPayload,
  listNames: Map<string, string>
): CardSummary => {
  return {
    id: card.id,
    name: card.name,
    idList: card.idList,
    listName: listNames.get(card.idList) ?? 'Unknown list',
    boardId: card.idBoard,
    closed: card.closed,
    shortUrl: card.shortUrl,
    due: card.due ?? null,
  };
};

/**
 * Mapea un payload crudo de Trello a entidad Card del dominio.
 */
export const mapToCard = (card: TrelloCardPayload, labels: Label[] = []): Card => {
  return createCard({
    id: card.id,
    name: card.name,
    listId: card.idList,
    boardId: card.idBoard,
    url: card.shortUrl,
    description: card.desc ?? '',
    due: card.due ?? null,
    closed: card.closed,
    labels,
    pos: card.pos?.toString(),
  });
};

/**
 * Mapea un payload crudo de Trello a entidad List del dominio.
 */
export const mapToList = (list: TrelloListPayload, boardId: string): List => {
  return createList({
    id: list.id,
    name: list.name,
    boardId: list.idBoard ?? boardId,
  });
};

/**
 * Mapea un payload crudo de Trello a entidad Label del dominio.
 */
export const mapToLabel = (label: TrelloLabelPayload): Label => {
  return createLabel({
    id: label.id,
    name: label.name,
    color: label.color,
  });
};

/**
 * Mapea una accion de comentario Trello a entidad Comment del dominio.
 */
export const mapToComment = (action: TrelloCommentPayload): Comment => {
  return createComment({
    id: action.id,
    text: action.data.text,
    creator: action.memberCreator?.fullName ?? action.memberCreator?.username ?? 'Unknown creator',
    date: action.date,
  });
};
