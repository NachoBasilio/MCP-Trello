import { describe, expect, it } from 'vitest';

import {
  CardQueryVO,
  CommentSchema,
  LabelSchema,
  createComment,
  createLabel,
} from '../../../src/domain/index.js';

/**
 * Verifica que el barrel publico del dominio exponga las APIs canonicas para
 * entidades y value objects consumidos por el resto del proyecto.
 */
describe('Exports publicos del dominio', () => {
  /**
   * Valida que los exports de labels mantengan el contrato publico esperado.
   */
  it('debe exportar la API canonica de labels', () => {
    const label = createLabel({ id: 'label123', name: 'bug', color: 'red' });

    expect(LabelSchema.parse(label)).toEqual(label);
  });

  /**
   * Confirma que la entidad Comment siga disponible desde el barrel principal.
   */
  it('debe exportar la API de la entidad comment', () => {
    const comment = createComment({
      id: 'comment123',
      text: 'Assigned to Nacho',
      creator: 'ignadev',
      date: '2026-03-27T10:00:00.000Z',
    });

    expect(CommentSchema.parse(comment)).toEqual(comment);
  });

  /**
   * Asegura que el value object de busqueda de tarjetas quede expuesto desde el barrel.
   */
  it('debe exportar los value objects de consulta de tarjetas', () => {
    const query = CardQueryVO.create({ query: 'a' });

    expect(query.matchesCardName('AuthenticationService')).toBe(true);
  });
});
