import { describe, it, expect } from 'vitest';
import {
  LabelSchema,
  createLabel,
  TRELLO_LABEL_COLORS,
  type Label,
} from '../../../../src/domain/entities/Label.js';

/**
 * Cubre el contrato de labels y el set de colores validos expuestos por el dominio.
 */
describe('Entidad Label', () => {
  /**
   * Verifica el schema de labels y los campos requeridos para persistirlos.
   */
  describe('Esquema de labels', () => {
    it('debe parsear un label valido', () => {
      const label = {
        id: 'label123',
        name: 'bug',
        color: 'red',
      };

      const result = LabelSchema.safeParse(label);
      expect(result.success).toBe(true);
    });

    it('debe rechazar un label sin id', () => {
      const label = {
        name: 'bug',
        color: 'red',
      };

      const result = LabelSchema.safeParse(label);
      expect(result.success).toBe(false);
    });

    it('debe rechazar un label sin nombre', () => {
      const label = {
        id: 'label123',
        color: 'red',
      };

      const result = LabelSchema.safeParse(label);
      expect(result.success).toBe(false);
    });
  });

  /**
   * Confirma que la fabrica devuelva la entidad label sin perder datos.
   */
  describe('Fabrica de labels', () => {
    it('debe crear un label con todos sus campos', () => {
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

  /**
   * Valida que la lista de colores soportados refleje el contrato conocido de Trello.
   */
  describe('TRELLO_LABEL_COLORS', () => {
    it('debe contener todos los colores validos de Trello', () => {
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
