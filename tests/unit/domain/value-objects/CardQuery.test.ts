import { describe, it, expect } from 'vitest';
import { CardQueryVO } from '../../../../src/domain/value-objects/CardQuery.js';

/**
 * Cubre la construccion de consultas, el matcheo contra nombres y el escape para regex.
 */
describe('Objeto de valor de consulta de tarjetas (CardQueryVO)', () => {
  /**
   * Verifica la creacion del value object y sus defaults de busqueda.
   */
  describe('Creacion', () => {
    it('debe crear un CardQueryVO con los campos requeridos', () => {
      const query = CardQueryVO.create({ query: 'fix bug' });
      expect(query.query).toBe('fix bug');
      expect(query.limit).toBe(10);
      expect(query.boardId).toBeUndefined();
    });

    it('debe crear un CardQueryVO con todos sus campos', () => {
      const query = CardQueryVO.create({
        query: 'auth fail',
        boardId: 'board123',
        limit: 25,
      });
      expect(query.query).toBe('auth fail');
      expect(query.boardId).toBe('board123');
      expect(query.limit).toBe(25);
    });

    it('debe usar el limite por defecto de 10', () => {
      const query = CardQueryVO.create({ query: 'test' });
      expect(query.limit).toBe(10);
    });
  });

  /**
   * Confirma como se tokeniza la consulta antes de evaluar coincidencias.
   */
  describe('Obtencion de terminos', () => {
    it('debe dividir la consulta en terminos', () => {
      const query = CardQueryVO.create({ query: 'fix auth bug' });
      expect(query.getTerms()).toEqual(['fix', 'auth', 'bug']);
    });

    it('debe filtrar terminos menores a dos caracteres', () => {
      const query = CardQueryVO.create({ query: 'a fix auth b' });
      expect(query.getTerms()).toEqual(['fix', 'auth']);
    });

    it('debe convertir los terminos a minusculas', () => {
      const query = CardQueryVO.create({ query: 'FIX AUTH' });
      expect(query.getTerms()).toEqual(['fix', 'auth']);
    });

    it('debe lanzar error para una consulta vacia', () => {
      expect(() => CardQueryVO.create({ query: '' })).toThrow();
    });
  });

  /**
   * Valida el algoritmo de coincidencia contra el nombre de la tarjeta.
   */
  describe('Coincidencia contra nombres de tarjetas', () => {
    it('debe devolver true cuando todos los terminos coinciden', () => {
      const query = CardQueryVO.create({ query: 'fix auth' });
      expect(query.matchesCardName('Fix authentication bug')).toBe(true);
    });

    it('debe devolver false cuando algun termino no coincide', () => {
      const query = CardQueryVO.create({ query: 'fix auth' });
      expect(query.matchesCardName('Fix bug')).toBe(false);
    });

    it('debe ignorar diferencias de mayusculas', () => {
      const query = CardQueryVO.create({ query: 'FIX AUTH' });
      expect(query.matchesCardName('fix authentication')).toBe(true);
    });

    it('debe resolver consultas de un solo termino', () => {
      const query = CardQueryVO.create({ query: 'auth' });
      expect(query.matchesCardName('Authentication failure')).toBe(true);
    });

    it('debe resolver terminos cortos como substrings', () => {
      const query = CardQueryVO.create({ query: 'auth' });
      expect(query.matchesCardName('AuthenticationService')).toBe(true);
    });

    it('debe matchear consultas de un caracter contra el nombre de la tarjeta', () => {
      const query = CardQueryVO.create({ query: 'a' });
      expect(query.matchesCardName('AuthenticationService')).toBe(true);
    });

    it('debe devolver false cuando falta una consulta de un caracter', () => {
      const query = CardQueryVO.create({ query: 'z' });
      expect(query.matchesCardName('AuthenticationService')).toBe(false);
    });
  });

  /**
   * Asegura que el texto de consulta no rompa expresiones regulares dinamicas.
   */
  describe('Escape para regex', () => {
    it('debe escapar caracteres especiales de regex', () => {
      const query = CardQueryVO.create({ query: 'fix.*bug' });
      expect(query.escapeForRegex()).toBe('fix\\.\\*bug');
    });

    it('debe escapar parentesis', () => {
      const query = CardQueryVO.create({ query: 'test (foo)' });
      expect(query.escapeForRegex()).toBe('test \\(foo\\)');
    });
  });

  /**
   * Protege las invariantes de entrada para evitar consultas invalidas.
   */
  describe('Validaciones', () => {
    it('debe lanzar error para una consulta vacia', () => {
      expect(() => CardQueryVO.create({ query: '' })).toThrow();
    });

    it('debe lanzar error para una consulta con solo espacios', () => {
      expect(() => CardQueryVO.create({ query: '   ' })).toThrow();
    });

    it('debe lanzar error cuando el limite supera el maximo permitido', () => {
      expect(() => CardQueryVO.create({ query: 'test', limit: 100 })).toThrow();
    });

    it('debe lanzar error cuando el limite queda por debajo del minimo', () => {
      expect(() => CardQueryVO.create({ query: 'test', limit: 0 })).toThrow();
    });
  });
});
