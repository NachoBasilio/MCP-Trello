import { z as zod } from 'zod';

export const ListNameSchema = zod
  .string()
  .trim()
  .min(1, 'List name cannot be empty')
  .max(512, 'List name too long');

export type ListName = zod.infer<typeof ListNameSchema>;

/**
 * Objeto de valor para nombres de listas de Trello con comparacion insensible a mayusculas y minusculas.
 */
export class ListNameVO {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Crea un objeto de valor de nombre de lista con validacion previa.
   */
  static create(value: string): ListNameVO {
    const parsed = ListNameSchema.parse(value);
    return new ListNameVO(parsed);
  }

  /**
   * Crea un objeto de valor de nombre de lista y propaga el error original de Zod si falla.
   */
  static createUnsafe(value: string): ListNameVO {
    const result = ListNameSchema.safeParse(value);
    if (!result.success) {
      throw result.error;
    }
    return new ListNameVO(result.data);
  }

  equals(other: ListNameVO): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  matches(value: string): boolean {
    return this.value.toLowerCase() === value.toLowerCase();
  }
}
