import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import type { Order, OrderStatus } from '@/contracts/order';
import { getCheckoutResultOrderStatus } from '@/lib/payments/checkout-result';
import { reconcileMercadoPagoPaymentApproval } from '@/lib/payments/mercadopago-reconciliation';
import { validateMercadoPagoWebhookSignature } from '@/lib/webhooks/mercadopago-signature';

function orderFixture(status: OrderStatus = 'payment_pending'): Order {
  return {
    id: 'order_123',
    publicId: 'ord_12345678',
    templateSlug: 'psicologo-clinico-agenda',
    customer: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    },
    brief: {
      businessName: 'Ada Studio',
      industry: 'Consulting',
      goal: 'Launch a professional site that explains services and captures leads.',
      hasLogo: true,
      hasCopy: true,
      hasDomain: true,
    },
    amountARS: 150000,
    currency: 'ARS',
    status,
    createdAt: '2026-06-29T00:00:00.000Z',
    updatedAt: '2026-06-29T00:00:00.000Z',
  };
}

function approvedPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: '123456789',
    status: 'approved',
    external_reference: 'ord_12345678',
    transaction_amount: 150000,
    currency_id: 'ARS',
    ...overrides,
  };
}

describe('Mercado Pago webhook idempotency coverage', () => {
  it('does not duplicate order or payment-attempt effects for a duplicate approved webhook', async () => {
    let currentOrder = orderFixture('payment_pending');
    const transition = vi.fn().mockImplementation(async ({ to }) => {
      currentOrder = orderFixture(to);
      return currentOrder;
    });
    const dependencies = {
      orderRepository: {
        findByPublicId: vi.fn().mockImplementation(async () => currentOrder),
        transition,
      },
      paymentAttemptRepository: {
        updateLatestStatus: vi.fn().mockResolvedValue({ id: 'payatt_123' }),
      },
      fetch: vi.fn().mockImplementation(async () => Response.json(approvedPayment())),
    };

    await reconcileMercadoPagoPaymentApproval(
      { providerPaymentId: '123456789' },
      { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
      dependencies,
    );
    await reconcileMercadoPagoPaymentApproval(
      { providerPaymentId: '123456789' },
      { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
      dependencies,
    );

    expect(transition).toHaveBeenCalledTimes(2);
    expect(transition).toHaveBeenNthCalledWith(1, {
      publicId: 'ord_12345678',
      to: 'paid',
      reason: 'Mercado Pago payment approved',
    });
    expect(transition).toHaveBeenNthCalledWith(2, {
      publicId: 'ord_12345678',
      to: 'ready_for_production',
      reason: 'Mercado Pago payment reconciled',
    });
    expect(
      dependencies.paymentAttemptRepository.updateLatestStatus,
    ).toHaveBeenCalledTimes(1);
    expect(currentOrder.status).toBe('ready_for_production');
  });

  it('marks an approved verified payment ready through the state machine', async () => {
    const paidOrder = orderFixture('paid');
    const readyOrder = orderFixture('ready_for_production');
    const dependencies = {
      orderRepository: {
        findByPublicId: vi.fn().mockResolvedValue(orderFixture('pending_payment')),
        transition: vi
          .fn()
          .mockResolvedValueOnce(paidOrder)
          .mockResolvedValueOnce(readyOrder),
      },
      paymentAttemptRepository: {
        updateLatestStatus: vi.fn().mockResolvedValue({ id: 'payatt_123' }),
      },
      fetch: vi.fn().mockResolvedValue(Response.json(approvedPayment())),
    };

    const result = await reconcileMercadoPagoPaymentApproval(
      { providerPaymentId: '123456789' },
      { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
      dependencies,
    );

    expect(result.order.status).toBe('ready_for_production');
    expect(dependencies.paymentAttemptRepository.updateLatestStatus).toHaveBeenCalledWith({
      orderPublicId: 'ord_12345678',
      providerStatus: 'approved',
      providerPaymentId: '123456789',
    });
  });

  it('does not mark rejected payments paid', async () => {
    const dependencies = {
      orderRepository: {
        findByPublicId: vi.fn().mockResolvedValue(orderFixture('payment_pending')),
        transition: vi.fn(),
      },
      paymentAttemptRepository: {
        updateLatestStatus: vi.fn(),
      },
      fetch: vi.fn().mockResolvedValue(
        Response.json(approvedPayment({ status: 'rejected' })),
      ),
    };

    await expect(
      reconcileMercadoPagoPaymentApproval(
        { providerPaymentId: '123456789' },
        { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
        dependencies,
      ),
    ).rejects.toThrow('Mercado Pago payment is not approved: rejected');
    expect(dependencies.orderRepository.transition).not.toHaveBeenCalled();
    expect(dependencies.paymentAttemptRepository.updateLatestStatus).not.toHaveBeenCalled();
  });

  it('fails invalid webhook signatures before processing', () => {
    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: 'ts=1704908010,v1=bad_signature',
        xRequestId: 'request-123',
        dataId: '123456789',
        webhookSecret: 'webhook_secret',
      }),
    ).toBe(false);
  });

  it('fails amount mismatches before marking paid', async () => {
    const dependencies = {
      orderRepository: {
        findByPublicId: vi.fn().mockResolvedValue(orderFixture('payment_pending')),
        transition: vi.fn(),
      },
      paymentAttemptRepository: {
        updateLatestStatus: vi.fn(),
      },
      fetch: vi.fn().mockResolvedValue(
        Response.json(approvedPayment({ transaction_amount: 149999 })),
      ),
    };

    await expect(
      reconcileMercadoPagoPaymentApproval(
        { providerPaymentId: '123456789' },
        { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
        dependencies,
      ),
    ).rejects.toThrow('Mercado Pago payment amount does not match order amount.');
    expect(dependencies.orderRepository.transition).not.toHaveBeenCalled();
    expect(dependencies.paymentAttemptRepository.updateLatestStatus).not.toHaveBeenCalled();
  });

  it('explicit no-touch: a success URL alone does not load or transition an order', async () => {
    const orderRepository = {
      findByPublicId: vi.fn(),
    };

    const result = await getCheckoutResultOrderStatus(
      { status: 'approved', payment_id: '123456789' },
      orderRepository,
    );

    expect(result).toEqual({});
    expect(orderRepository.findByPublicId).not.toHaveBeenCalled();
  });
});
