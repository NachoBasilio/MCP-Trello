import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z as zod } from 'zod';

import type { MoveCardUseCase } from '../../application/move-card.js';
import { isErr } from '../../shared/index.js';

const moveCardSchemaBase = zod.object({
  cardName: zod.string().trim().min(1).optional(),
  cardId: zod.string().trim().min(1).optional(),
  toList: zod.string().trim().min(1).optional(),
  toListId: zod.string().trim().min(1).optional(),
  boardId: zod.string().trim().min(1).optional(),
  boardName: zod.string().trim().min(1).optional(),
});

export const moveCardInputSchema = moveCardSchemaBase
  .refine((value) => typeof value.cardId === 'string' || typeof value.cardName === 'string', {
    message: 'cardId or cardName is required',
    path: ['cardId'],
  })
  .refine((value) => typeof value.toListId === 'string' || typeof value.toList === 'string', {
    message: 'toListId or toList is required',
    path: ['toListId'],
  });

export const moveCardOutputSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  listId: zod.string(),
  boardId: zod.string(),
});

export interface MoveCardToolHandler {
  name: 'trello_move_card';
  title: string;
  description: string;
  inputSchema: typeof moveCardSchemaBase.shape;
  outputSchema: typeof moveCardOutputSchema.shape;
  execute: (arguments_: unknown) => Promise<CallToolResult>;
}

/**
 * Handler MCP para mover tarjetas entre listas en Trello.
 */
export const createMoveCardTool = (useCase: MoveCardUseCase): MoveCardToolHandler => {
  return {
    name: 'trello_move_card',
    title: 'Mover tarjeta en Trello',
    description:
      'Mueve una tarjeta usando toListId (recomendado) o toList por nombre; con nombre crea la lista si no existe.',
    inputSchema: moveCardSchemaBase.shape,
    outputSchema: moveCardOutputSchema.shape,
    execute: async (arguments_: unknown): Promise<CallToolResult> => {
      const input = moveCardInputSchema.parse(arguments_);
      const result = await useCase.execute(input);

      if (isErr(result)) {
        throw result.error;
      }

      const output = {
        id: result.value.id,
        name: result.value.name,
        listId: result.value.listId,
        boardId: result.value.boardId,
      };

      return {
        content: [
          {
            type: 'text',
            text: `Tarjeta movida: ${output.name} -> lista ${output.listId}`,
          },
        ],
        structuredContent: output,
      };
    },
  };
};
