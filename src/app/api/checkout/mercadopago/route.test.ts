import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import type { Order, OrderStatus } from '@/contracts/order';

const { getOrderByPublicId, createCheckout, createMercadoPagoProvider, loadMercadoPagoProviderConfig } = vi.hoisted(() => ({
  getOrderByPublicId: vi.fn(),
  createCheckout: vi.fn(),
  createMercadoPagoProvider: vi.fn(),
  loadMercadoPagoProviderConfig: vi.fn(),
}));

vi.mock('@/lib/orders/prisma-order-repository', () => ({
  getOrderByPublicId,
}));

vi.mock('@/lib/payments/mercadopago-provider', () => ({
  createMercadoPagoProvider,
  loadMercadoPagoProviderConfig,
}));

const { POST } = await import('./route');

function orderFixture(status: OrderStatus = 'pending_payment'): Order {
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
  return new Request('http://localhost/api/checkout/mercadopago', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('Mercado Pago checkout route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadMercadoPagoProviderConfig.mockReturnValue({
      accessToken: 'test_access_token',
      baseUrl: 'https://example.com',
    });
    createCheckout.mockResolvedValue({
      provider: 'mercadopago',
      orderPublicId: 'ord_test_123',
      providerPreferenceId: 'pref_123',
      checkoutUrl: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123',
    });
    createMercadoPagoProvider.mockReturnValue({
      provider: 'mercadopago',
      createCheckout,
    });
  });

  it('creates a Mercado Pago checkout for an existing payable order', async () => {
    getOrderByPublicId.mockResolvedValue(orderFixture('pending_payment'));

    const response = await POST(request({ orderPublicId: 'ord_test_123' }));

    expect(response.status).toBe(201);
    expect(loadMercadoPagoProviderConfig).toHaveBeenCalledOnce();
    expect(createMercadoPagoProvider).toHaveBeenCalledWith({
      accessToken: 'test_access_token',
      baseUrl: 'https://example.com',
    });
    expect(createCheckout).toHaveBeenCalledWith({ orderPublicId: 'ord_test_123' });
    await expect(response.json()).resolves.toEqual({
      checkout: {
        provider: 'mercadopago',
        orderPublicId: 'ord_test_123',
        providerPreferenceId: 'pref_123',
        checkoutUrl:
          'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123',
      },
    });
  });

  it('rejects a missing order before loading provider configuration', async () => {
    getOrderByPublicId.mockResolvedValue(undefined);

    const response = await POST(request({ orderPublicId: 'ord_missing' }));

    expect(response.status).toBe(404);
    expect(loadMercadoPagoProviderConfig).not.toHaveBeenCalled();
    expect(createCheckout).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ error: 'order_not_found' });
  });

  it('rejects invalid order status before creating checkout', async () => {
    getOrderByPublicId.mockResolvedValue(orderFixture('paid'));

    const response = await POST(request({ orderPublicId: 'ord_test_123' }));

    expect(response.status).toBe(409);
    expect(loadMercadoPagoProviderConfig).not.toHaveBeenCalled();
    expect(createCheckout).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_order_status_for_checkout',
      status: 'paid',
    });
  });

  it('rejects missing provider configuration', async () => {
    getOrderByPublicId.mockResolvedValue(orderFixture('pending_payment'));
    loadMercadoPagoProviderConfig.mockImplementation(() => {
      throw new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['MERCADO_PAGO_ACCESS_TOKEN'],
          message: 'Invalid input: expected string',
          input: undefined,
        },
      ]);
    });

    const response = await POST(request({ orderPublicId: 'ord_test_123' }));

    expect(response.status).toBe(500);
    expect(createCheckout).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: 'missing_payment_provider_config',
      message: 'Mercado Pago provider configuration is missing or invalid.',
    });
  });

  it('rejects frontend-provided amounts before reading the order', async () => {
    const response = await POST(
      request({ orderPublicId: 'ord_test_123', amountARS: 1 }),
    );

    expect(response.status).toBe(400);
    expect(getOrderByPublicId).not.toHaveBeenCalled();
    expect(createCheckout).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: 'frontend_amount_not_allowed',
      message: 'Checkout amounts are calculated on the server.',
    });
  });

  it('rejects nested frontend-provided amounts before reading the order', async () => {
    const response = await POST(
      request({ orderPublicId: 'ord_test_123', metadata: { price: 1 } }),
    );

    expect(response.status).toBe(400);
    expect(getOrderByPublicId).not.toHaveBeenCalled();
    expect(createCheckout).not.toHaveBeenCalled();
  });

  it('rejects unknown non-amount fields', async () => {
    const response = await POST(
      request({ orderPublicId: 'ord_test_123', coupon: 'NOPE' }),
    );

    expect(response.status).toBe(400);
    expect(getOrderByPublicId).not.toHaveBeenCalled();
    expect(createCheckout).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid_checkout_input',
    });
  });
});
