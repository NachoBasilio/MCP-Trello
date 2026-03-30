import { z as zod } from 'zod';

export const BoardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  description: zod.string().optional().default(''),
  url: zod.string().optional(),
  closed: zod.boolean().optional().default(false),
});

export type Board = zod.infer<typeof BoardSchema>;

/**
 * Contrato publico de resumen para respuestas orientadas a boards.
 */
export interface BoardSummary {
  id: string;
  name: string;
  description: string;
  url: string;
  closed: boolean;
  lists: { id: string; name: string; cardsCount: number }[];
  members: { id: string; fullName: string; username: string }[];
}

/**
 * Crea una entidad de board del dominio con validacion previa.
 */
export const createBoard = (input: {
  id: string;
  name: string;
  description?: string;
  url?: string;
  closed?: boolean;
}): Board => {
  return BoardSchema.parse({
    id: input.id,
    name: input.name,
    description: input.description ?? '',
    url: input.url,
    closed: input.closed ?? false,
  });
};
