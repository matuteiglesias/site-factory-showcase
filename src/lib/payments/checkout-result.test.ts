import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import type { Order } from '@/contracts/order';
import { getCheckoutResultOrderStatus } from '@/lib/payments/checkout-result';

const order: Order = {
  id: 'order_123',
  publicId: 'ord_12345678',
  templateSlug: 'psicologo-clinico-agenda',
  customer: {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  },
  brief: {
    goal: 'Crear un sitio profesional para tomar consultas online.',
    hasLogo: true,
    hasCopy: false,
    hasDomain: true,
  },
  amountARS: 150000,
  currency: 'ARS',
  status: 'payment_pending',
  createdAt: '2026-06-29T00:00:00.000Z',
  updatedAt: '2026-06-29T00:00:00.000Z',
};

describe('checkout result status lookup', () => {
  it('loads the current order status from the order repository', async () => {
    const orderRepository = {
      findByPublicId: vi.fn().mockResolvedValue(order),
    };

    const result = await getCheckoutResultOrderStatus(
      { external_reference: order.publicId, status: 'approved' },
      orderRepository,
    );

    expect(orderRepository.findByPublicId).toHaveBeenCalledWith(order.publicId);
    expect(result).toEqual({
      orderPublicId: order.publicId,
      order,
    });
  });

  it('does not treat payment query params as proof or lookup keys', async () => {
    const orderRepository = {
      findByPublicId: vi.fn().mockResolvedValue(undefined),
    };

    const result = await getCheckoutResultOrderStatus(
      { payment_id: '123', status: 'approved' },
      orderRepository,
    );

    expect(orderRepository.findByPublicId).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('reports the requested order id even when no order exists', async () => {
    const orderRepository = {
      findByPublicId: vi.fn().mockResolvedValue(undefined),
    };

    const result = await getCheckoutResultOrderStatus(
      { order: 'ord_missing' },
      orderRepository,
    );

    expect(result).toEqual({
      orderPublicId: 'ord_missing',
      order: undefined,
    });
  });
});
