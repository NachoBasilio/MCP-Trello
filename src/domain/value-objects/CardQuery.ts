import { z as zod } from 'zod';

export const CardQuerySchema = zod.object({
  query: zod.string().trim().min(1, 'Query cannot be empty'),
  boardId: zod.string().optional(),
  limit: zod.number().int().min(1).max(50).optional().default(10),
});

export type CardQuery = zod.infer<typeof CardQuerySchema>;

/**
 * Objeto de valor que encapsula la semantica de busqueda de tarjetas usada por la capa de dominio.
 */
export class CardQueryVO {
  public readonly query: string;
  public readonly boardId?: string;
  public readonly limit: number;

  private constructor(query: string, boardId: string | undefined, limit: number) {
    this.query = query;
    this.boardId = boardId;
    this.limit = limit;
  }

  /**
   * Crea un objeto de valor de consulta de tarjeta con validacion previa.
   */
  static create(input: { query: string; boardId?: string; limit?: number }): CardQueryVO {
    const parsed = CardQuerySchema.parse(input);
    return new CardQueryVO(parsed.query, parsed.boardId, parsed.limit);
  }

  /**
   * Crea un objeto de valor de consulta de tarjeta y propaga el error original de Zod si falla.
   */
  static createUnsafe(input: { query: string; boardId?: string; limit?: number }): CardQueryVO {
    const result = CardQuerySchema.safeParse(input);
    if (!result.success) {
      throw result.error;
    }
    return new CardQueryVO(result.data.query, result.data.boardId, result.data.limit);
  }

  getTerms(): string[] {
    return this.query.toLowerCase().split(/\s+/).filter((term) => term.length >= 2);
  }

  matchesCardName(cardName: string): boolean {
    const normalizedQuery = this.query.toLowerCase();
    const queryTerms = this.getTerms();
    const normalizedCardName = cardName.toLowerCase();

    if (queryTerms.length === 0) {
      return normalizedCardName.includes(normalizedQuery);
    }

    return queryTerms.every((term) => normalizedCardName.includes(term));
  }

  escapeForRegex(): string {
    return this.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
