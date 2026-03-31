import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';

import { createDeleteCardUseCase } from '../../../src/application/delete-card.js';
import type { TrelloGateway } from '../../../src/application/ports.js';
import { DomainError } from '../../../src/domain/index.js';

describe('DeleteCardUseCase', () => {
  let mockGateway: Mocked<TrelloGateway>;
  let useCase: ReturnType<typeof createDeleteCardUseCase>;

  beforeEach(() => {
    mockGateway = {
      resolveBoard: vi.fn(),
      listCards: vi.fn(),
      listBoardLists: vi.fn(),
      createList: vi.fn(),
      resolveBoardId: vi.fn(),
      addComment: vi.fn(),
      listBoards: vi.fn(),
      createCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
      listBoardLabels: vi.fn(),
      addLabel: vi.fn(),
      createLabel: vi.fn(),
      listCardComments: vi.fn(),
    };

    useCase = createDeleteCardUseCase(mockGateway);
  });

  it('debe eliminar la tarjeta directo si se provee cardId', async () => {
    mockGateway.deleteCard.mockResolvedValue({ ok: true, value: undefined });

    const result = await useCase.execute({ cardId: 'c1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('c1');
    }
    expect(mockGateway.deleteCard).toHaveBeenCalledWith('c1');
    expect(mockGateway.resolveBoard).not.toHaveBeenCalled();
  });

  it('debe resolver board y buscar tarjeta por nombre si no se provee cardId', async () => {
    mockGateway.resolveBoard.mockResolvedValue({ ok: true, value: 'b1' });
    mockGateway.listCards.mockResolvedValue({
      ok: true,
      value: [{ id: 'c1', name: 'Mi Tarjeta', idList: 'l1', boardId: 'b1', shortUrl: '', closed: false }],
    });
    mockGateway.deleteCard.mockResolvedValue({ ok: true, value: undefined });

    const result = await useCase.execute({
      cardName: 'Mi Tarjeta',
      boardId: 'b1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('c1');
    }
    expect(mockGateway.resolveBoard).toHaveBeenCalledWith({ boardId: 'b1', boardName: undefined });
    expect(mockGateway.listCards).toHaveBeenCalledWith('b1');
    expect(mockGateway.deleteCard).toHaveBeenCalledWith('c1');
  });

  it('debe fallar si no encuentra la tarjeta por nombre', async () => {
    mockGateway.resolveBoard.mockResolvedValue({ ok: true, value: 'b1' });
    mockGateway.listCards.mockResolvedValue({
      ok: true,
      value: [{ id: 'c1', name: 'Otra Tarjeta', idList: 'l1', boardId: 'b1', shortUrl: '', closed: false }],
    });

    const result = await useCase.execute({
      cardName: 'Mi Tarjeta',
      boardId: 'b1',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('CARD_NOT_FOUND');
    }
    expect(mockGateway.deleteCard).not.toHaveBeenCalled();
  });

  it('debe fallar si hay ambigüedad por multiples tarjetas con el mismo nombre', async () => {
    mockGateway.resolveBoard.mockResolvedValue({ ok: true, value: 'b1' });
    mockGateway.listCards.mockResolvedValue({
      ok: true,
      value: [
        { id: 'c1', name: 'Mi Tarjeta', idList: 'l1', boardId: 'b1', shortUrl: '', closed: false },
        { id: 'c2', name: 'Mi Tarjeta', idList: 'l2', boardId: 'b1', shortUrl: '', closed: false },
      ],
    });

    const result = await useCase.execute({
      cardName: 'Mi Tarjeta',
      boardId: 'b1',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(DomainError);
      expect(result.error.code).toBe('CARD_AMBIGUOUS');
    }
    expect(mockGateway.deleteCard).not.toHaveBeenCalled();
  });
});
