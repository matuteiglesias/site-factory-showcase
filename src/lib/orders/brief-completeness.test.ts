import { describe, expect, it } from 'vitest';

import type { Order } from '@/contracts/order';
import {
  getBriefMissingFields,
  isOrderBriefComplete,
} from '@/lib/orders/brief-completeness';

function orderFixture(overrides: Partial<Order['brief']> = {}): Order {
  return {
    id: 'order_test_123',
    publicId: 'ord_test_123',
    templateSlug: 'psicologo-clinico-agenda',
    customer: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      whatsapp: '+54 9 11 5555 5555',
    },
    brief: {
      businessName: 'Ada Studio',
      industry: 'Consulting',
      goal: 'Launch a professional site that explains services and captures leads.',
      hasLogo: false,
      hasCopy: false,
      hasDomain: false,
      ...overrides,
    },
    amountARS: 180000,
    currency: 'ARS',
    status: 'pending_payment',
    createdAt: '2026-06-28T12:00:00.000Z',
    updatedAt: '2026-06-28T12:00:00.000Z',
  };
}

describe('brief completeness helpers', () => {
  it('marks a brief complete when all ops-critical text fields are present', () => {
    const order = orderFixture();

    expect(isOrderBriefComplete(order)).toBe(true);
    expect(getBriefMissingFields(order)).toEqual([]);
  });

  it('returns human-readable missing field labels for incomplete briefs', () => {
    const order = orderFixture({
      businessName: undefined,
      industry: '   ',
    });

    expect(isOrderBriefComplete(order)).toBe(false);
    expect(getBriefMissingFields(order)).toEqual([
      'Nombre del negocio o profesional',
      'Rubro o industria',
    ]);
  });
});
