import { describe, expect, it } from 'vitest';

import {
  CommentSchema,
  createComment,
  type Comment,
} from '../../../../src/domain/entities/Comment.js';

/**
 * Cubre la validacion estructural y la fabrica de comentarios del dominio.
 */
describe('Entidad Comment', () => {
  /**
   * Verifica que el schema acepte comentarios validos y rechace fechas invalidas.
   */
  describe('Esquema de comments', () => {
    it('debe parsear un comentario valido', () => {
      const comment = {
        id: 'comment123',
        text: 'Assigned to Nacho',
        creator: 'ignadev',
        date: '2026-03-27T10:00:00.000Z',
      };

      const result = CommentSchema.safeParse(comment);
      expect(result.success).toBe(true);
    });

    it('debe rechazar una fecha invalida en el comentario', () => {
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

  /**
   * Confirma que la fabrica preserve todos los campos del comentario creado.
   */
  describe('Fabrica de comments', () => {
    it('debe crear un comentario con todos sus campos', () => {
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
