import { describe, expect, it } from 'vitest';

import {
  CommentSchema,
  createComment,
  type Comment,
} from '../../../../src/domain/entities/Comment.js';

describe('Comment Entity', () => {
  describe('CommentSchema', () => {
    it('should parse a valid comment', () => {
      const comment = {
        id: 'comment123',
        text: 'Assigned to Nacho',
        creator: 'ignadev',
        date: '2026-03-27T10:00:00.000Z',
      };

      const result = CommentSchema.safeParse(comment);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid comment date', () => {
      const comment = {
        id: 'comment123',
        text: 'Assigned to Nacho',
        creator: 'ignadev',
        date: 'not-a-date',
      };

      const result = CommentSchema.safeParse(comment);
      expect(result.success).toBe(false);
    });
  });

  describe('createComment factory', () => {
    it('should create a comment with all fields', () => {
      const comment: Comment = createComment({
        id: 'comment123',
        text: 'Assigned to Nacho',
        creator: 'ignadev',
        date: '2026-03-27T10:00:00.000Z',
      });

      expect(comment.id).toBe('comment123');
      expect(comment.text).toBe('Assigned to Nacho');
      expect(comment.creator).toBe('ignadev');
      expect(comment.date).toBe('2026-03-27T10:00:00.000Z');
    });
  });
});
