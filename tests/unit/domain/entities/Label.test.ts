import { describe, it, expect } from 'vitest';
import {
  LabelSchema,
  createLabel,
  TRELLO_LABEL_COLORS,
  type Label,
} from '../../../../src/domain/entities/Label.js';

describe('Label Entity', () => {
  describe('LabelSchema', () => {
    it('should parse a valid label', () => {
      const label = {
        id: 'label123',
        name: 'bug',
        color: 'red',
      };

      const result = LabelSchema.safeParse(label);
      expect(result.success).toBe(true);
    });

    it('should reject label without id', () => {
      const label = {
        name: 'bug',
        color: 'red',
      };

      const result = LabelSchema.safeParse(label);
      expect(result.success).toBe(false);
    });

    it('should reject label without name', () => {
      const label = {
        id: 'label123',
        color: 'red',
      };

      const result = LabelSchema.safeParse(label);
      expect(result.success).toBe(false);
    });
  });

  describe('createLabel factory', () => {
    it('should create a label with all fields', () => {
      const label: Label = createLabel({
        id: 'label123',
        name: 'urgent',
        color: 'orange',
      });

      expect(label.id).toBe('label123');
      expect(label.name).toBe('urgent');
      expect(label.color).toBe('orange');
    });
  });

  describe('TRELLO_LABEL_COLORS', () => {
    it('should contain all valid Trello colors', () => {
      expect(TRELLO_LABEL_COLORS).toContain('blue');
      expect(TRELLO_LABEL_COLORS).toContain('green');
      expect(TRELLO_LABEL_COLORS).toContain('red');
      expect(TRELLO_LABEL_COLORS).toContain('orange');
      expect(TRELLO_LABEL_COLORS).toContain('purple');
      expect(TRELLO_LABEL_COLORS).toContain('pink');
      expect(TRELLO_LABEL_COLORS).toContain('sky');
      expect(TRELLO_LABEL_COLORS).toContain('lime');
      expect(TRELLO_LABEL_COLORS).toContain('black');
      expect(TRELLO_LABEL_COLORS).toContain('yellow');
    });
  });
});
