import { z as zod } from 'zod';

import { TRELLO_LABEL_COLORS } from '../domain/index.js';

const trimmedString = (field: string) => zod.string().trim().min(1, `${field} cannot be empty`);

const optionalBoardId = trimmedString('boardId').optional();
const optionalBoardName = trimmedString('boardName').optional();
const optionalLabelId = trimmedString('labelId').optional();
const optionalLabelName = trimmedString('labelName').optional();

export const boardSelectorSchema = zod.object({
  boardId: optionalBoardId,
  boardName: optionalBoardName,
});

const enforceBoardSelector = (value: zod.infer<typeof boardSelectorSchema>, ctx: zod.RefinementCtx) => {
  if (typeof value.boardId !== 'string' && typeof value.boardName !== 'string') {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: 'boardId or boardName is required',
      path: ['boardId'],
    });
  }
};

export const labelSelectorSchema = zod.object({
  labelId: optionalLabelId,
  labelName: optionalLabelName,
});

export const trelloLabelSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  color: zod.string(),
});

export const trelloCardSummarySchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  idList: zod.string(),
  listName: zod.string(),
  boardId: zod.string(),
  closed: zod.boolean(),
  shortUrl: zod.string().url(),
  due: zod.string().nullable(),
});

export const trelloSearchCardsInputSchema = zod.object({
  query: trimmedString('query'),
  boardId: optionalBoardId,
  boardName: optionalBoardName,
  limit: zod.number().int().min(1).max(50).optional().default(10),
});

export const trelloSearchCardSchema = trelloCardSummarySchema;

export const trelloSearchCardsOutputSchema = zod.object({
  boardId: zod.string(),
  cards: zod.array(trelloCardSummarySchema),
  truncated: zod.boolean(),
});

export const trelloAddCommentInputSchemaShape = {
  cardId: trimmedString('cardId').optional(),
  cardName: trimmedString('cardName').optional(),
  boardId: optionalBoardId,
  boardName: optionalBoardName,
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

const listBoardLabelsInputSchemaBase = boardSelectorSchema;
export const trelloListBoardLabelsInputSchema = listBoardLabelsInputSchemaBase.superRefine(enforceBoardSelector);
export const trelloListBoardLabelsInputSchemaBase = listBoardLabelsInputSchemaBase;

export const trelloListBoardLabelsOutputSchema = zod.object({
  boardId: zod.string(),
  labelCount: zod.number().int().nonnegative(),
  labels: zod.array(trelloLabelSchema),
});

const resolveLabelInputSchemaBase = boardSelectorSchema.extend({
  labelName: trimmedString('labelName'),
});
export const trelloResolveLabelInputSchema = resolveLabelInputSchemaBase.superRefine(enforceBoardSelector);
export const trelloResolveLabelInputSchemaBase = resolveLabelInputSchemaBase;

export const trelloResolveLabelOutputSchema = zod.object({
  boardId: zod.string(),
  label: trelloLabelSchema,
});

export const listLabelCardsLimitSchema = zod.number().int().min(1).max(100).optional().default(50);

const listLabelCardsInputBaseSchema = boardSelectorSchema
  .merge(labelSelectorSchema)
  .extend({
    limit: listLabelCardsLimitSchema,
  });
export const trelloListLabelCardsInputSchemaBase = listLabelCardsInputBaseSchema;

const validateLabelReference = (value: zod.infer<typeof listLabelCardsInputBaseSchema>, ctx: zod.RefinementCtx) => {
  const hasLabelReference = typeof value.labelId === 'string' || typeof value.labelName === 'string';
  if (!hasLabelReference) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: 'labelId or labelName is required',
      path: ['labelId'],
    });
  }

  if (typeof value.labelName === 'string' && typeof value.boardId !== 'string' && typeof value.boardName !== 'string') {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: 'boardId or boardName is required when labelName is used',
      path: ['boardId'],
    });
  }
};

export const trelloListLabelCardsInputSchema = listLabelCardsInputBaseSchema.superRefine(validateLabelReference);

export const trelloListLabelCardsOutputSchema = zod.object({
  boardId: zod.string(),
  label: trelloLabelSchema,
  cards: zod.array(trelloCardSummarySchema),
  cardCount: zod.number().int().nonnegative(),
  truncated: zod.boolean(),
});

export const searchCardsByLabelLimitSchema = zod.number().int().min(1).max(25).optional().default(10);

const searchCardsByLabelInputBaseSchema = listLabelCardsInputBaseSchema
  .omit({ limit: true })
  .extend({
    query: trimmedString('query'),
    limit: searchCardsByLabelLimitSchema,
  });
export const trelloSearchCardsByLabelInputSchemaBase = searchCardsByLabelInputBaseSchema;

export const trelloSearchCardsByLabelInputSchema = searchCardsByLabelInputBaseSchema.superRefine(validateLabelReference);

export const trelloSearchCardsByLabelOutputSchema = trelloListLabelCardsOutputSchema.extend({
  query: zod.string(),
});

const labelColorEnum = zod.enum(TRELLO_LABEL_COLORS);

const updateLabelInputSchemaBase = boardSelectorSchema
  .merge(labelSelectorSchema)
  .extend({
    newName: trimmedString('newName').optional(),
    newColor: labelColorEnum.optional(),
  });
export const trelloUpdateLabelInputSchema = updateLabelInputSchemaBase
  .superRefine((value, ctx) => {
    const hasLabelReference = typeof value.labelId === 'string' || typeof value.labelName === 'string';
    if (!hasLabelReference) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'labelId or labelName is required',
        path: ['labelId'],
      });
    }

    if (!value.newName && !value.newColor) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'newName or newColor is required',
        path: ['newName'],
      });
    }

    if (typeof value.labelName === 'string' && typeof value.boardId !== 'string' && typeof value.boardName !== 'string') {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'boardId or boardName is required when labelName is used',
        path: ['boardId'],
      });
    }
  });
export const trelloUpdateLabelInputSchemaBase = updateLabelInputSchemaBase;

export const trelloUpdateLabelOutputSchema = zod.object({
  label: trelloLabelSchema,
});

export type TrelloSearchCardsInput = zod.infer<typeof trelloSearchCardsInputSchema>;
export type TrelloSearchCardsOutput = zod.infer<typeof trelloSearchCardsOutputSchema>;
export type TrelloAddCommentInput = zod.infer<typeof trelloAddCommentInputSchema>;
export type TrelloAddCommentOutput = zod.infer<typeof trelloAddCommentOutputSchema>;
export type TrelloListBoardsOutput = zod.infer<typeof trelloListBoardsOutputSchema>;
export type TrelloListBoardLabelsInput = zod.infer<typeof trelloListBoardLabelsInputSchema>;
export type TrelloListBoardLabelsOutput = zod.infer<typeof trelloListBoardLabelsOutputSchema>;
export type TrelloResolveLabelInput = zod.infer<typeof trelloResolveLabelInputSchema>;
export type TrelloResolveLabelOutput = zod.infer<typeof trelloResolveLabelOutputSchema>;
export type TrelloListLabelCardsInput = zod.infer<typeof trelloListLabelCardsInputSchema>;
export type TrelloListLabelCardsOutput = zod.infer<typeof trelloListLabelCardsOutputSchema>;
export type TrelloSearchCardsByLabelInput = zod.infer<typeof trelloSearchCardsByLabelInputSchema>;
export type TrelloSearchCardsByLabelOutput = zod.infer<typeof trelloSearchCardsByLabelOutputSchema>;
export type TrelloUpdateLabelInput = zod.infer<typeof trelloUpdateLabelInputSchema>;
export type TrelloUpdateLabelOutput = zod.infer<typeof trelloUpdateLabelOutputSchema>;
export type TrelloLabel = zod.infer<typeof trelloLabelSchema>;
