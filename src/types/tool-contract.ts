import { z as zod } from 'zod';

export const trelloSearchCardsInputSchema = zod.object({
  query: zod.string().trim().min(1, 'Query cannot be empty'),
  boardId: zod.string().trim().min(1, 'boardId cannot be empty').optional(),
  boardName: zod.string().trim().min(1, 'boardName cannot be empty').optional(),
  limit: zod.number().int().min(1).max(50).optional().default(10),
});

export const trelloSearchCardSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  idList: zod.string(),
  listName: zod.string(),
  boardId: zod.string(),
  closed: zod.boolean(),
  shortUrl: zod.string().url(),
  due: zod.string().nullable(),
});

export const trelloSearchCardsOutputSchema = zod.object({
  boardId: zod.string(),
  cards: zod.array(trelloSearchCardSchema),
  truncated: zod.boolean(),
});

export const trelloAddCommentInputSchemaShape = {
  cardId: zod.string().trim().min(1, 'cardId cannot be empty').optional(),
  cardName: zod.string().trim().min(1, 'cardName cannot be empty').optional(),
  boardId: zod.string().trim().min(1, 'boardId cannot be empty').optional(),
  boardName: zod.string().trim().min(1, 'boardName cannot be empty').optional(),
  text: zod.string().refine((value) => value.trim().length > 0, 'Comment text cannot be empty'),
} as const;

export const trelloAddCommentInputSchema = zod
  .object(trelloAddCommentInputSchemaShape)
  .refine((value) => typeof value.cardId === 'string' || typeof value.cardName === 'string', {
    message: 'cardId or cardName is required',
    path: ['cardId'],
  });

export const trelloAddCommentOutputSchema = zod.object({
  id: zod.string(),
  text: zod.string(),
  creator: zod.string(),
  date: zod.string().datetime(),
});

export const trelloListBoardsOutputSchema = zod.object({
  boards: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
    })
  ),
});

export type TrelloSearchCardsInput = zod.infer<typeof trelloSearchCardsInputSchema>;
export type TrelloSearchCardsOutput = zod.infer<typeof trelloSearchCardsOutputSchema>;
export type TrelloAddCommentInput = zod.infer<typeof trelloAddCommentInputSchema>;
export type TrelloAddCommentOutput = zod.infer<typeof trelloAddCommentOutputSchema>;
export type TrelloListBoardsOutput = zod.infer<typeof trelloListBoardsOutputSchema>;
