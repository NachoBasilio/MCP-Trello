import { describe, expect, it } from 'vitest';

import { mapToCardSummary, mapToCard, mapToList, mapToLabel, mapToComment } from '../../../../src/infrastructure/trello/mappers.js';

/**
 * Protege el mapeo de payloads crudos de Trello a entidades del dominio.
 */
describe('Mappers de Trello', () => {
  /**
   * Verifica que mapToCardSummary resuelve el nombre de lista y preserva los campos del DTO.
   */
  it('debe mapear un CardSummary con el nombre de lista resuelto', () => {
    const listNames = new Map([
      ['list-1', 'To Do'],
      ['list-2', 'Doing'],
    ]);
    const dto = {
      id: 'card-1',
      name: 'Fix auth',
      idList: 'list-1',
      idBoard: 'board-1',
      closed: false,
      shortUrl: 'https://trello.com/c/card-1',
      due: null,
    };

    const summary = mapToCardSummary(dto, listNames);

    expect(summary).toEqual({
      id: 'card-1',
      name: 'Fix auth',
      idList: 'list-1',
      listName: 'To Do',
      boardId: 'board-1',
      closed: false,
      shortUrl: 'https://trello.com/c/card-1',
      due: null,
    });
  });

  /**
   * Confirma que mapToCardSummary usa "Unknown list" cuando la lista no existe en el mapa.
   */
  it('debe usar "Unknown list" cuando el idList no esta en el mapa', () => {
    const listNames = new Map<string, string>();
    const dto = {
      id: 'card-2',
      name: 'Ghost card',
      idList: 'list-999',
      idBoard: 'board-1',
      closed: false,
      shortUrl: 'https://trello.com/c/card-2',
      due: null,
    };

    const summary = mapToCardSummary(dto, listNames);

    expect(summary.listName).toBe('Unknown list');
  });

  /**
   * Verifica que mapToCard crea una Card del dominio con los campos esperados.
   */
  it('debe mapear un payload a Card del dominio', () => {
    const dto = {
      id: 'card-3',
      name: 'Ship feature',
      idList: 'list-1',
      idBoard: 'board-1',
      desc: 'Una descripcion',
      closed: false,
      shortUrl: 'https://trello.com/c/card-3',
      due: '2026-04-01T00:00:00.000Z',
      idLabels: ['label-1'],
    };

    const card = mapToCard(dto);

    expect(card.id).toBe('card-3');
    expect(card.name).toBe('Ship feature');
    expect(card.description).toBe('Una descripcion');
    expect(card.due).toBe('2026-04-01T00:00:00.000Z');
    expect(card.closed).toBe(false);
  });

  /**
   * Verifica que mapToList crea una Lista del dominio con el boardId provisto.
   */
  it('debe mapear una lista usando el boardId provisto', () => {
    const dto = { id: 'list-1', name: 'Backlog' };
    const list = mapToList(dto, 'board-1');

    expect(list).toEqual({ id: 'list-1', name: 'Backlog', boardId: 'board-1' });
  });

  /**
   * Verifica que mapToList usa el boardId del payload cuando existe.
   */
  it('debe usar el boardId del payload de la lista si esta presente', () => {
    const dto = { id: 'list-2', name: 'Doing', idBoard: 'board-real' };
    const list = mapToList(dto, 'board-1');

    expect(list.boardId).toBe('board-real');
  });

  /**
   * Verifica que mapToLabel mapea id, nombre y color correctamente.
   */
  it('debe mapear un payload de label', () => {
    const dto = { id: 'label-1', name: 'bug', color: 'red' };
    const label = mapToLabel(dto);

    expect(label).toEqual({ id: 'label-1', name: 'bug', color: 'red' });
  });

  /**
   * Verifica que mapToComment extrae texto, creator y fecha de una accion Trello.
   */
  it('debe mapear una accion de comentario con memberCreator', () => {
    const dto = {
      id: 'action-1',
      date: '2026-03-30T12:00:00.000Z',
      data: { text: 'Comentario test' },
      memberCreator: { fullName: 'Ignacio', username: 'ignadev' },
    };

    const comment = mapToComment(dto);

    expect(comment.id).toBe('action-1');
    expect(comment.text).toBe('Comentario test');
    expect(comment.creator).toBe('Ignacio');
    expect(comment.date).toBe('2026-03-30T12:00:00.000Z');
  });

  /**
   * Confirma que mapToComment usa el username cuando falta fullName.
   */
  it('debe usar el username como creator cuando no hay fullName', () => {
    const dto = {
      id: 'action-2',
      date: '2026-03-30T12:00:00.000Z',
      data: { text: 'Otro comentario' },
      memberCreator: { username: 'ignadev' },
    };

    const comment = mapToComment(dto);

    expect(comment.creator).toBe('ignadev');
  });

  /**
   * Confirma que mapToComment usa "Unknown creator" cuando falta memberCreator.
   */
  it('debe usar "Unknown creator" cuando no hay memberCreator', () => {
    const dto = {
      id: 'action-3',
      date: '2026-03-30T12:00:00.000Z',
      data: { text: 'Sin autor' },
    };

    const comment = mapToComment(dto);

    expect(comment.creator).toBe('Unknown creator');
  });
});
