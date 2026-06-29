import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { createMercadoPagoSignature } from '@/lib/webhooks/mercadopago-signature';

const {
  createWebhookEventRecord,
  markWebhookEventProcessed,
  loadMercadoPagoWebhookConfig,
  reconcileMercadoPagoPaymentApproval,
} = vi.hoisted(() => ({
  createWebhookEventRecord: vi.fn(),
  markWebhookEventProcessed: vi.fn(),
  loadMercadoPagoWebhookConfig: vi.fn(),
  reconcileMercadoPagoPaymentApproval: vi.fn(),
}));

vi.mock('@/lib/fake-db/store', () => ({
  createWebhookEventRecord,
  markWebhookEventProcessed,
}));

vi.mock('@/lib/payments/mercadopago-reconciliation', () => ({
  reconcileMercadoPagoPaymentApproval,
}));

vi.mock('@/lib/webhooks/mercadopago-signature', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/lib/webhooks/mercadopago-signature')
  >();

  return {
    ...actual,
    loadMercadoPagoWebhookConfig,
  };
});

const { POST } = await import('./route');

function signedRequest(input: {
  body: unknown;
  dataId?: string;
  topic?: string;
  secret?: string;
  xRequestId?: string;
  timestamp?: string;
  signatureOverride?: string;
}) {
  const dataId = input.dataId ?? '999999999';
  const xRequestId = input.xRequestId ?? 'request-123';
  const timestamp = input.timestamp ?? '1704908010';
  const secret = input.secret ?? 'webhook_secret';
  const signature =
    input.signatureOverride ??
    createMercadoPagoSignature({
      dataId,
      xRequestId,
      timestamp,
      webhookSecret: secret,
    });
  const url = new URL('http://localhost/api/webhooks/mercadopago');
  url.searchParams.set('data.id', dataId);

  if (input.topic) {
    url.searchParams.set('type', input.topic);
  }

  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': xRequestId,
      'x-signature': `ts=${timestamp},v1=${signature}`,
    },
    body: JSON.stringify(input.body),
  });
}

describe('Mercado Pago webhook route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadMercadoPagoWebhookConfig.mockReturnValue({
      webhookSecret: 'webhook_secret',
    });
    createWebhookEventRecord.mockResolvedValue({ id: 'wh_123' });
    markWebhookEventProcessed.mockResolvedValue({ id: 'wh_123' });
    reconcileMercadoPagoPaymentApproval.mockResolvedValue({
      providerPaymentId: '999999999',
    });
  });

  it('validates the signature, stores the raw event, and returns quickly', async () => {
    const body = {
      id: 'event_123',
      action: 'payment.created',
      type: 'payment',
      data: {
        id: '999999999',
      },
    };

    const response = await POST(
      signedRequest({ body, dataId: '999999999', topic: 'payment' }),
    );

    expect(response.status).toBe(202);
    expect(createWebhookEventRecord).toHaveBeenCalledWith({
      providerEventId: 'event_123',
      topic: 'payment',
      action: 'payment.created',
      dataId: '999999999',
      xRequestId: 'request-123',
      xSignature: expect.stringMatching(/^ts=1704908010,v1=/),
      rawBody: JSON.stringify(body),
      processingStatus: 'received',
    });
    expect(reconcileMercadoPagoPaymentApproval).toHaveBeenCalledWith({
      providerPaymentId: '999999999',
    });
    expect(markWebhookEventProcessed).toHaveBeenCalledWith({
      webhookEventId: 'wh_123',
      processingStatus: 'processed',
    });
    await expect(response.json()).resolves.toEqual({ received: true });
  });

  it('rejects invalid signatures without storing the event', async () => {
    const response = await POST(
      signedRequest({
        body: { id: 'event_123', data: { id: '999999999' } },
        dataId: '999999999',
        signatureOverride: '0'.repeat(64),
      }),
    );

    expect(response.status).toBe(401);
    expect(createWebhookEventRecord).not.toHaveBeenCalled();
    expect(reconcileMercadoPagoPaymentApproval).not.toHaveBeenCalled();
    expect(markWebhookEventProcessed).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: 'invalid_signature',
    });
  });

  it('rejects missing webhook config without storing the event', async () => {
    loadMercadoPagoWebhookConfig.mockImplementation(() => {
      throw new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['MERCADO_PAGO_WEBHOOK_SECRET'],
          message: 'Invalid input: expected string',
          input: undefined,
        },
      ]);
    });

    const response = await POST(
      signedRequest({ body: { id: 'event_123' }, dataId: '999999999' }),
    );

    expect(response.status).toBe(500);
    expect(createWebhookEventRecord).not.toHaveBeenCalled();
    expect(reconcileMercadoPagoPaymentApproval).not.toHaveBeenCalled();
    expect(markWebhookEventProcessed).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: 'missing_mercado_pago_webhook_config',
      message: 'Mercado Pago webhook signature configuration is missing.',
    });
  });

  it('marks the stored raw event failed when verified reconciliation fails', async () => {
    reconcileMercadoPagoPaymentApproval.mockRejectedValue(
      new Error('Mercado Pago payment amount does not match order amount.'),
    );

    const response = await POST(
      signedRequest({
        body: { id: 'event_123', type: 'payment', data: { id: '999999999' } },
        dataId: '999999999',
        topic: 'payment',
      }),
    );

    expect(response.status).toBe(202);
    expect(createWebhookEventRecord).toHaveBeenCalledOnce();
    expect(markWebhookEventProcessed).toHaveBeenCalledWith({
      webhookEventId: 'wh_123',
      processingStatus: 'failed',
      processingError: 'Mercado Pago payment amount does not match order amount.',
    });
  });

});
