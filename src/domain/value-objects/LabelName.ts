import { z as zod } from 'zod';

export const LabelNameSchema = zod
  .string()
  .trim()
  .min(1, 'Label name cannot be empty')
  .max(512, 'Label name too long');

export type LabelName = zod.infer<typeof LabelNameSchema>;

/**
 * Objeto de valor para nombres de etiquetas de Trello con comparacion insensible a mayusculas y minusculas.
 */
export class LabelNameVO {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Crea un objeto de valor de nombre de etiqueta con validacion previa.
   */
  static create(value: string): LabelNameVO {
    const parsed = LabelNameSchema.parse(value);
    return new LabelNameVO(parsed);
  }

  /**
   * Crea un objeto de valor de nombre de etiqueta y propaga el error original de Zod si falla.
   */
  static createUnsafe(value: string): LabelNameVO {
    const result = LabelNameSchema.safeParse(value);
    if (!result.success) {
      throw result.error;
    }
    return new LabelNameVO(result.data);
  }

  equals(other: LabelNameVO): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  matches(value: string): boolean {
    return this.value.toLowerCase() === value.toLowerCase();
  }
}
