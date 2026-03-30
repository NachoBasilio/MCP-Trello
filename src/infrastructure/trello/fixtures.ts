import type { CardSummary, Comment, Label, List } from '../../domain/index.js';

/**
 * Payloads crudos de la API de Trello para uso exclusivo en tests y mappers.
 * No exponer fuera de infrastructure/trello.
 */

export const fixtures = {
  /**
   * Payload de una lista Trello.
   */
  list: (overrides: Partial<{ id: string; name: string }> = {}): { id: string; name: string } => ({
    id: overrides.id ?? 'list-1',
    name: overrides.name ?? 'To Do',
  }),

  /**
   * Payload de una tarjeta Trello.
   */
  card: (
    overrides: Partial<{
      id: string;
      name: string;
      idList: string;
      idBoard: string;
      desc: string;
      closed: boolean;
      shortUrl: string;
      due: string | null;
      idLabels: string[];
      pos: number;
    }> = {}
  ) => ({
    id: overrides.id ?? 'card-1',
    name: overrides.name ?? 'Fix authentication bug',
    idList: overrides.idList ?? 'list-1',
    idBoard: overrides.idBoard ?? 'board-1',
    desc: overrides.desc ?? '',
    closed: overrides.closed ?? false,
    shortUrl: overrides.shortUrl ?? 'https://trello.com/c/card-1',
    due: overrides.due ?? null,
    idLabels: overrides.idLabels ?? [],
    pos: overrides.pos ?? 1,
  }),

  /**
   * Payload de una label Trello.
   */
  label: (
    overrides: Partial<{ id: string; name: string; color: string }> = {}
  ): { id: string; name: string; color: string } => ({
    id: overrides.id ?? 'label-1',
    name: overrides.name ?? 'bug',
    color: overrides.color ?? 'red',
  }),

  /**
   * Payload de una accion de comentario Trello.
   */
  commentAction: (
    overrides: Partial<{
      id: string;
      date: string;
      text: string;
      creatorName: string;
      creatorUsername: string;
    }> = {}
  ) => ({
    id: overrides.id ?? 'action-1',
    date: overrides.date ?? '2026-03-29T10:00:00.000Z',
    data: {
      text: overrides.text ?? 'Assigned to Nacho',
    },
    memberCreator: {
      fullName: overrides.creatorName ?? 'Ignacio Nicolas Basilio Buracco',
      username: overrides.creatorUsername ?? 'ignacionicolasbasilioburacco',
    },
  }),

  /**
   * Payload de un board Trello.
   */
  board: (
    overrides: Partial<{ id: string; name: string }> = {}
  ): { id: string; name: string } => ({
    id: overrides.id ?? 'board-1',
    name: overrides.name ?? 'Platform Roadmap',
  }),

  /**
   * CardSummary interno usado en assertions de tests.
   */
  cardSummary: (overrides: Partial<CardSummary> = {}): CardSummary => ({
    id: overrides.id ?? 'card-1',
    name: overrides.name ?? 'Fix authentication bug',
    idList: overrides.idList ?? 'list-1',
    listName: overrides.listName ?? 'To Do',
    boardId: overrides.boardId ?? 'board-1',
    closed: overrides.closed ?? false,
    shortUrl: overrides.shortUrl ?? 'https://trello.com/c/card-1',
    due: overrides.due ?? null,
  }),

  /**
   * List del dominio.
   */
  domainList: (overrides: Partial<List> = {}): List => ({
    id: overrides.id ?? 'list-1',
    name: overrides.name ?? 'To Do',
    boardId: overrides.boardId ?? 'board-1',
  }),

  /**
   * Label del dominio.
   */
  domainLabel: (overrides: Partial<Label> = {}): Label => ({
    id: overrides.id ?? 'label-1',
    name: overrides.name ?? 'bug',
    color: overrides.color ?? 'red',
  }),

  /**
   * Comment del dominio.
   */
  domainComment: (overrides: Partial<Comment> = {}): Comment => ({
    id: overrides.id ?? 'action-1',
    text: overrides.text ?? 'Assigned to Nacho',
    creator: overrides.creator ?? 'Ignacio Nicolas Basilio Buracco',
    date: overrides.date ?? '2026-03-29T10:00:00.000Z',
  }),
};
