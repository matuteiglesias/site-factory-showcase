import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import type { Order } from '@/contracts/order';
import type { MercadoPagoProviderDependencies } from '@/lib/payments/mercadopago-provider';
import {
  createMercadoPagoProvider,
  loadMercadoPagoProviderConfig,
} from '@/lib/payments/mercadopago-provider';

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
  status: 'pending_payment',
  createdAt: '2026-06-29T00:00:00.000Z',
  updatedAt: '2026-06-29T00:00:00.000Z',
};

function createDependencies(
  overrides: Partial<MercadoPagoProviderDependencies> = {},
): MercadoPagoProviderDependencies {
  return {
    orderRepository: {
      findByPublicId: vi.fn().mockResolvedValue(order),
    },
    paymentAttemptRepository: {
      create: vi.fn().mockResolvedValue({}),
    },
    fetch: vi.fn().mockResolvedValue(
      Response.json({
        id: 'pref_123',
        init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123',
      }),
    ),
    ...overrides,
  };
}

describe('Mercado Pago provider', () => {
  it('loads required server configuration', () => {
    const config = loadMercadoPagoProviderConfig({
      MERCADO_PAGO_ACCESS_TOKEN: 'test_access_token',
      NEXT_PUBLIC_BASE_URL: 'https://example.com',
    });

    expect(config).toEqual({
      accessToken: 'test_access_token',
      baseUrl: 'https://example.com',
    });
  });

  it('rejects missing configuration before provider use', () => {
    expect(() => loadMercadoPagoProviderConfig({})).toThrow();
  });

  it('requires an existing order before creating a preference', async () => {
    const dependencies = createDependencies({
      orderRepository: {
        findByPublicId: vi.fn().mockResolvedValue(undefined),
      },
    });
    const provider = createMercadoPagoProvider(
      { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
      dependencies,
    );

    await expect(
      provider.createCheckout({ orderPublicId: 'ord_missing123' }),
    ).rejects.toThrow('Order not found: ord_missing123');
    expect(dependencies.fetch).not.toHaveBeenCalled();
    expect(dependencies.paymentAttemptRepository.create).not.toHaveBeenCalled();
  });

  it('creates a checkout preference from server-side order data and stores a payment attempt', async () => {
    const dependencies = createDependencies();
    const provider = createMercadoPagoProvider(
      { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
      dependencies,
    );

    const checkout = await provider.createCheckout({
      orderPublicId: order.publicId,
    });

    expect(dependencies.fetch).toHaveBeenCalledWith(
      'https://api.mercadopago.com/checkout/preferences',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test_access_token',
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      }),
    );

    const [, requestInit] = vi.mocked(dependencies.fetch).mock.calls[0];
    const preferenceBody = JSON.parse(String(requestInit?.body));

    expect(preferenceBody).toMatchObject({
      external_reference: order.publicId,
      items: [
        {
          quantity: 1,
          unit_price: order.amountARS,
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: order.customer.name,
        email: order.customer.email,
      },
      back_urls: {
        success: 'https://example.com/checkout/success',
        failure: 'https://example.com/checkout/failure',
        pending: 'https://example.com/checkout/pending',
      },
      notification_url: 'https://example.com/api/webhooks/mercadopago',
    });

    expect(dependencies.paymentAttemptRepository.create).toHaveBeenCalledWith({
      order,
      providerPreferenceId: 'pref_123',
      checkoutUrl:
        'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123',
      rawResponse: {
        id: 'pref_123',
        init_point:
          'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123',
      },
    });
    expect(checkout).toEqual({
      provider: 'mercadopago',
      orderPublicId: order.publicId,
      providerPreferenceId: 'pref_123',
      checkoutUrl:
        'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_123',
    });
  });
});
