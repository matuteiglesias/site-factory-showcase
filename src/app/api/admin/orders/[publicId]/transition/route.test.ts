import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Order, OrderStatus } from '@/contracts/order';

const { getOrderByPublicId, transitionOrderRecord } = vi.hoisted(() => ({
  getOrderByPublicId: vi.fn(),
  transitionOrderRecord: vi.fn(),
}));

vi.mock('@/lib/orders/prisma-order-repository', () => ({
  getOrderByPublicId,
  transitionOrderRecord,
}));

const { POST } = await import('./route');

function orderFixture(status: OrderStatus): Order {
  return {
    id: 'order_test_123',
    publicId: 'ord_test_123',
    templateSlug: 'psicologo-clinico-agenda',
    customer: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    },
    brief: {
      businessName: 'Ada Studio',
      industry: 'Consulting',
      goal: 'Launch a professional site that explains services and captures leads.',
      hasLogo: false,
      hasCopy: false,
      hasDomain: false,
    },
    amountARS: 180000,
    currency: 'ARS',
    status,
    createdAt: '2026-06-28T12:00:00.000Z',
    updatedAt: '2026-06-28T12:00:00.000Z',
  };
}

function request(body: unknown): Request {
  return new Request('http://localhost/api/admin/orders/ord_test_123/transition', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ publicId: 'ord_test_123' });

describe('admin order transition route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs an allowed manual transition through the order repository', async () => {
    const currentOrder = orderFixture('ready_for_production');
    const transitionedOrder = orderFixture('in_production');
    getOrderByPublicId.mockResolvedValueOnce(currentOrder);
    transitionOrderRecord.mockResolvedValueOnce(transitionedOrder);

    const response = await POST(request({ to: 'in_production' }), { params });

    expect(response.status).toBe(200);
    expect(transitionOrderRecord).toHaveBeenCalledWith({
      publicId: 'ord_test_123',
      to: 'in_production',
      reason: 'Manual admin transition',
    });
    await expect(response.json()).resolves.toEqual({ order: transitionedOrder });
  });

  it('rejects arbitrary status assignment before updating the order', async () => {
    getOrderByPublicId.mockResolvedValueOnce(orderFixture('pending_payment'));

    const response = await POST(request({ to: 'delivered' }), { params });

    expect(response.status).toBe(409);
    expect(transitionOrderRecord).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: 'transition_not_allowed',
      from: 'pending_payment',
      to: 'delivered',
    });
  });

  it('rejects payloads that do not use the controlled transition shape', async () => {
    getOrderByPublicId.mockResolvedValueOnce(orderFixture('pending_payment'));

    const response = await POST(request({ status: 'cancelled' }), { params });

    expect(response.status).toBe(400);
    expect(transitionOrderRecord).not.toHaveBeenCalled();
  });
});
