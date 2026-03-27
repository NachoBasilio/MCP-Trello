import { describe, it, expect } from 'vitest';
import { LabelNameVO } from '../../../../src/domain/value-objects/LabelName.js';

/**
 * Cubre normalizacion, comparacion e invariantes del nombre de labels.
 */
describe('Objeto de valor de nombre de label (LabelNameVO)', () => {
  /**
   * Verifica la creacion del value object y la limpieza de espacios sobrantes.
   */
  describe('Creacion', () => {
    it('debe crear un LabelNameVO valido', () => {
      const name = LabelNameVO.create('bug');
      expect(name.value).toBe('bug');
    });

    it('debe recortar espacios al inicio y al final', () => {
      const name = LabelNameVO.create('  urgent  ');
      expect(name.value).toBe('urgent');
    });
  });

  /**
   * Confirma la igualdad semantica aunque cambie el casing de entrada.
   */
  describe('Igualdad', () => {
    it('debe devolver true para nombres identicos', () => {
      const name1 = LabelNameVO.create('bug');
      const name2 = LabelNameVO.create('bug');
      expect(name1.equals(name2)).toBe(true);
    });

    it('debe devolver true cuando solo cambia el uso de mayusculas', () => {
      const name1 = LabelNameVO.create('BUG');
      const name2 = LabelNameVO.create('bug');
      expect(name1.equals(name2)).toBe(true);
    });

    it('debe devolver false para nombres distintos', () => {
      const name1 = LabelNameVO.create('bug');
      const name2 = LabelNameVO.create('feature');
      expect(name1.equals(name2)).toBe(false);
    });
  });

  /**
   * Valida las coincidencias simples contra texto libre usado en filtros.
   */
  describe('Coincidencias', () => {
    it('debe devolver true para coincidencias sin distinguir mayusculas', () => {
      const name = LabelNameVO.create('bug');
      expect(name.matches('BUG')).toBe(true);
    });

    it('debe devolver false cuando el texto no coincide', () => {
      const name = LabelNameVO.create('bug');
      expect(name.matches('feature')).toBe(false);
    });
  });

  /**
   * Protege las invariantes del nombre: presencia real y largo maximo.
   */
  describe('Validaciones', () => {
    it('debe lanzar error para un nombre vacio', () => {
      expect(() => LabelNameVO.create('')).toThrow();
    });

    it('debe lanzar error para un nombre con solo espacios', () => {
      expect(() => LabelNameVO.create('   ')).toThrow();
    });

    it('debe lanzar error cuando el nombre supera el maximo permitido', () => {
      const longName = 'a'.repeat(513);
      expect(() => LabelNameVO.create(longName)).toThrow();
    });
  });
});
