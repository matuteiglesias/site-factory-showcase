import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import type { Order } from '@/contracts/order';
import type { ReconcileMercadoPagoPaymentDependencies } from '@/lib/payments/mercadopago-reconciliation';
import { reconcileMercadoPagoPaymentApproval } from '@/lib/payments/mercadopago-reconciliation';

function orderFixture(overrides: Partial<Order> = {}): Order {
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
    status: 'payment_pending',
    createdAt: '2026-06-29T00:00:00.000Z',
    updatedAt: '2026-06-29T00:00:00.000Z',
    ...overrides,
  };
}

function createDependencies(
  overrides: Partial<ReconcileMercadoPagoPaymentDependencies> = {},
): ReconcileMercadoPagoPaymentDependencies {
  const order = orderFixture();
  const paidOrder = orderFixture({ status: 'paid' });
  const readyOrder = orderFixture({ status: 'ready_for_production' });

  return {
    orderRepository: {
      findByPublicId: vi.fn().mockResolvedValue(order),
      transition: vi
        .fn()
        .mockResolvedValueOnce(paidOrder)
        .mockResolvedValueOnce(readyOrder),
    },
    paymentAttemptRepository: {
      updateLatestStatus: vi.fn().mockResolvedValue({
        id: 'payatt_123',
        providerStatus: 'approved',
      }),
    },
    fetch: vi.fn().mockResolvedValue(
      Response.json({
        id: '123456789',
        status: 'approved',
        external_reference: order.publicId,
        transaction_amount: order.amountARS,
        currency_id: order.currency,
      }),
    ),
    ...overrides,
  };
}

describe('Mercado Pago payment reconciliation', () => {
  it('fetches the provider payment, verifies it, updates the attempt, and transitions through the state machine', async () => {
    const dependencies = createDependencies();

    const result = await reconcileMercadoPagoPaymentApproval(
      { providerPaymentId: '123456789' },
      { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
      dependencies,
    );

    expect(dependencies.fetch).toHaveBeenCalledWith(
      'https://api.mercadopago.com/v1/payments/123456789',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer test_access_token',
        },
      },
    );
    expect(dependencies.orderRepository.findByPublicId).toHaveBeenCalledWith(
      'ord_12345678',
    );
    expect(
      dependencies.paymentAttemptRepository.updateLatestStatus,
    ).toHaveBeenCalledWith({
      orderPublicId: 'ord_12345678',
      providerStatus: 'approved',
      providerPaymentId: '123456789',
    });
    expect(dependencies.orderRepository.transition).toHaveBeenNthCalledWith(1, {
      publicId: 'ord_12345678',
      to: 'paid',
      reason: 'Mercado Pago payment approved',
    });
    expect(dependencies.orderRepository.transition).toHaveBeenNthCalledWith(2, {
      publicId: 'ord_12345678',
      to: 'ready_for_production',
      reason: 'Mercado Pago payment reconciled',
    });
    expect(result.order.status).toBe('ready_for_production');
    expect(result.providerPaymentId).toBe('123456789');
  });

  it('rejects non-approved payments before updating attempts or orders', async () => {
    const order = orderFixture();
    const dependencies = createDependencies({
      orderRepository: {
        findByPublicId: vi.fn().mockResolvedValue(order),
        transition: vi.fn(),
      },
      fetch: vi.fn().mockResolvedValue(
        Response.json({
          id: '123456789',
          status: 'rejected',
          external_reference: order.publicId,
          transaction_amount: order.amountARS,
          currency_id: order.currency,
        }),
      ),
    });

    await expect(
      reconcileMercadoPagoPaymentApproval(
        { providerPaymentId: '123456789' },
        { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
        dependencies,
      ),
    ).rejects.toThrow('Mercado Pago payment is not approved: rejected');

    expect(
      dependencies.paymentAttemptRepository.updateLatestStatus,
    ).not.toHaveBeenCalled();
    expect(dependencies.orderRepository.transition).not.toHaveBeenCalled();
  });

  it('rejects amount, currency, and external reference mismatches', async () => {
    const order = orderFixture();
    const mismatchCases = [
      {
        payment: {
          id: '123456789',
          status: 'approved',
          external_reference: 'ord_other',
          transaction_amount: order.amountARS,
          currency_id: order.currency,
        },
        error: 'Order not found: ord_other',
      },
      {
        payment: {
          id: '123456789',
          status: 'approved',
          external_reference: order.publicId,
          transaction_amount: order.amountARS + 1,
          currency_id: order.currency,
        },
        error: 'Mercado Pago payment amount does not match order amount.',
      },
      {
        payment: {
          id: '123456789',
          status: 'approved',
          external_reference: order.publicId,
          transaction_amount: order.amountARS,
          currency_id: 'USD',
        },
        error: 'Mercado Pago payment currency does not match order currency.',
      },
    ];

    for (const mismatchCase of mismatchCases) {
      const dependencies = createDependencies({
        orderRepository: {
          findByPublicId: vi
            .fn()
            .mockResolvedValue(
              mismatchCase.payment.external_reference === order.publicId
                ? order
                : undefined,
            ),
          transition: vi.fn(),
        },
        fetch: vi.fn().mockResolvedValue(Response.json(mismatchCase.payment)),
      });

      await expect(
        reconcileMercadoPagoPaymentApproval(
          { providerPaymentId: '123456789' },
          { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
          dependencies,
        ),
      ).rejects.toThrow(mismatchCase.error);
      expect(
        dependencies.paymentAttemptRepository.updateLatestStatus,
      ).not.toHaveBeenCalled();
      expect(dependencies.orderRepository.transition).not.toHaveBeenCalled();
    }
  });

  it('does not duplicate transitions when the order has already moved past paid', async () => {
    const order = orderFixture({ status: 'ready_for_production' });
    const dependencies = createDependencies({
      orderRepository: {
        findByPublicId: vi.fn().mockResolvedValue(order),
        transition: vi.fn(),
      },
      fetch: vi.fn().mockResolvedValue(
        Response.json({
          id: '123456789',
          status: 'approved',
          external_reference: order.publicId,
          transaction_amount: order.amountARS,
          currency_id: order.currency,
        }),
      ),
    });

    const result = await reconcileMercadoPagoPaymentApproval(
      { providerPaymentId: '123456789' },
      { accessToken: 'test_access_token', baseUrl: 'https://example.com' },
      dependencies,
    );

    expect(dependencies.orderRepository.transition).not.toHaveBeenCalled();
    expect(result.order.status).toBe('ready_for_production');
  });
});
