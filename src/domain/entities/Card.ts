import { z as zod } from 'zod';

import { LabelSchema, type Label } from './Label.js';

export const CardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  description: zod.string().optional().default(''),
  due: zod.string().nullable().optional(),
  dueComplete: zod.boolean().optional().default(false),
  listId: zod.string(),
  boardId: zod.string(),
  labels: zod.array(LabelSchema).optional().default([]),
  url: zod.string(),
  closed: zod.boolean().optional().default(false),
  pos: zod.string().optional(),
});

export type Card = zod.infer<typeof CardSchema>;

/**
 * Contrato publico de resultado de busqueda usado por consumidores del dominio y futuros casos de uso.
 */
export interface CardSummary {
  id: string;
  name: string;
  idList: string;
  listName?: string;
  boardId: string;
  closed: boolean;
  shortUrl: string;
  due?: string | null;
}

/**
 * Contrato publico de entrada para pedidos de creacion de tarjetas desde la capa de aplicacion.
 */
export interface CreateCardInput {
  name: string;
  listName?: string;
  boardId?: string;
  description?: string;
  pos?: 'top' | 'bottom' | 'up' | 'down';
}

/**
 * Contrato publico de entrada para actualizaciones parciales de tarjetas.
 */
export interface UpdateCardInput {
  name?: string;
  description?: string;
  due?: string | null;
  dueComplete?: boolean;
  listId?: string;
  pos?: string;
  closed?: boolean;
}

/**
 * Crea una entidad de tarjeta del dominio con validacion previa.
 */
export const createCard = (input: {
  id: string;
  name: string;
  listId: string;
  boardId: string;
  url: string;
  description?: string;
  due?: string | null;
  dueComplete?: boolean;
  labels?: Label[];
  closed?: boolean;
  pos?: string;
}): Card => {
  return CardSchema.parse({
    id: input.id,
    name: input.name,
    description: input.description ?? '',
    due: input.due ?? null,
    dueComplete: input.dueComplete ?? false,
    listId: input.listId,
    boardId: input.boardId,
    labels: input.labels ?? [],
    url: input.url,
    closed: input.closed ?? false,
    pos: input.pos,
  });
};
