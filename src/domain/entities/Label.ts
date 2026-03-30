import { z as zod } from 'zod';

export const LabelSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  color: zod.string(),
});

export type Label = zod.infer<typeof LabelSchema>;

export const TRELLO_LABEL_COLORS = [
  'blue',
  'green',
  'red',
  'orange',
  'purple',
  'pink',
  'sky',
  'lime',
  'black',
  'yellow',
] as const;

export type TrelloLabelColor = (typeof TRELLO_LABEL_COLORS)[number];

/**
 * Crea la entidad canonica de etiqueta compartida por toda la capa de dominio.
 */
export const createLabel = (input: {
  id: string;
  name: string;
  color: TrelloLabelColor | string;
}): Label => {
  return LabelSchema.parse({
    id: input.id,
    name: input.name,
    color: input.color,
  });
};

export const LabelEntitySchema = LabelSchema;
export type LabelEntity = Label;
