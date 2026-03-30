import { describe, it, expect } from 'vitest';
import { ListNameVO } from '../../../../src/domain/value-objects/ListName.js';

/**
 * Cubre normalizacion, comparacion e invariantes del nombre de listas.
 */
describe('Objeto de valor de nombre de lista (ListNameVO)', () => {
  /**
   * Verifica la creacion del value object y la normalizacion de espacios.
   */
  describe('Creacion', () => {
    it('debe crear un ListNameVO valido', () => {
      const name = ListNameVO.create('In Progress');
      expect(name.value).toBe('In Progress');
    });

    it('debe recortar espacios al inicio y al final', () => {
      const name = ListNameVO.create('  To Do  ');
      expect(name.value).toBe('To Do');
    });
  });

  /**
   * Confirma la igualdad semantica sin depender del casing original.
   */
  describe('Igualdad', () => {
    it('debe devolver true para nombres identicos', () => {
      const name1 = ListNameVO.create('In Progress');
      const name2 = ListNameVO.create('In Progress');
      expect(name1.equals(name2)).toBe(true);
    });

    it('debe devolver true cuando solo cambia el uso de mayusculas', () => {
      const name1 = ListNameVO.create('In Progress');
      const name2 = ListNameVO.create('in progress');
      expect(name1.equals(name2)).toBe(true);
    });

    it('debe devolver false para nombres distintos', () => {
      const name1 = ListNameVO.create('In Progress');
      const name2 = ListNameVO.create('Done');
      expect(name1.equals(name2)).toBe(false);
    });
  });

  /**
   * Valida la comparacion directa contra texto libre para filtros simples.
   */
  describe('Coincidencias', () => {
    it('debe devolver true para coincidencias sin distinguir mayusculas', () => {
      const name = ListNameVO.create('In Progress');
      expect(name.matches('in progress')).toBe(true);
    });

    it('debe devolver false cuando el texto no coincide', () => {
      const name = ListNameVO.create('In Progress');
      expect(name.matches('Done')).toBe(false);
    });
  });

  /**
   * Protege las invariantes del nombre: no vacio y dentro del largo permitido.
   */
  describe('Validaciones', () => {
    it('debe lanzar error para un nombre vacio', () => {
      expect(() => ListNameVO.create('')).toThrow();
    });

    it('debe lanzar error para un nombre con solo espacios', () => {
      expect(() => ListNameVO.create('   ')).toThrow();
    });

    it('debe lanzar error cuando el nombre supera el maximo permitido', () => {
      const longName = 'a'.repeat(513);
      expect(() => ListNameVO.create(longName)).toThrow();
    });
  });
});
