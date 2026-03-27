import { describe, expect, it } from 'vitest';

import {
  CardQueryVO,
  CommentSchema,
  LabelSchema,
  createComment,
  createLabel,
} from '../../../src/domain/index.js';

describe('Domain public barrel exports', () => {
  it('should export the canonical label API', () => {
    const label = createLabel({ id: 'label123', name: 'bug', color: 'red' });

    expect(LabelSchema.parse(label)).toEqual(label);
  });

  it('should export the comment entity API', () => {
    const comment = createComment({
      id: 'comment123',
      text: 'Assigned to Nacho',
      creator: 'ignadev',
      date: '2026-03-27T10:00:00.000Z',
    });

    expect(CommentSchema.parse(comment)).toEqual(comment);
  });

  it('should export card query value objects', () => {
    const query = CardQueryVO.create({ query: 'a' });

    expect(query.matchesCardName('AuthenticationService')).toBe(true);
  });
});
