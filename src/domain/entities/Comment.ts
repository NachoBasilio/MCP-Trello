import { z as zod } from 'zod';

export const CommentSchema = zod.object({
  id: zod.string(),
  text: zod.string(),
  creator: zod.string(),
  date: zod.string().datetime(),
});

export type Comment = zod.infer<typeof CommentSchema>;

/**
 * Crea una entidad de comentario del dominio con validacion previa para acciones de comentario de Trello.
 */
export const createComment = (input: {
  id: string;
  text: string;
  creator: string;
  date: string;
}): Comment => {
  return CommentSchema.parse(input);
};
