import { z as zod } from 'zod';

export const ListSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  boardId: zod.string(),
});

export type List = zod.infer<typeof ListSchema>;

/**
 * Crea una entidad de lista del dominio con validacion previa.
 */
export const createList = (input: { id: string; name: string; boardId: string }): List => {
  return ListSchema.parse(input);
};
