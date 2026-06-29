import { describe, expect, it } from 'vitest';

import {
  createMercadoPagoSignature,
  loadMercadoPagoWebhookConfig,
  validateMercadoPagoWebhookSignature,
} from '@/lib/webhooks/mercadopago-signature';

describe('Mercado Pago webhook signature validation', () => {
  it('loads the webhook secret from server environment', () => {
    expect(
      loadMercadoPagoWebhookConfig({
        MERCADO_PAGO_WEBHOOK_SECRET: 'webhook_secret',
      }),
    ).toEqual({ webhookSecret: 'webhook_secret' });
  });

  it('validates a matching x-signature header', () => {
    const signature = createMercadoPagoSignature({
      dataId: '12345',
      xRequestId: 'request-123',
      timestamp: '1704908010',
      webhookSecret: 'webhook_secret',
    });

    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: `ts=1704908010,v1=${signature}`,
        xRequestId: 'request-123',
        dataId: '12345',
        webhookSecret: 'webhook_secret',
      }),
    ).toBe(true);
  });

  it('rejects missing or mismatched signature inputs', () => {
    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: 'ts=1704908010,v1=bad',
        xRequestId: 'request-123',
        dataId: '12345',
        webhookSecret: 'webhook_secret',
      }),
    ).toBe(false);

    expect(
      validateMercadoPagoWebhookSignature({
        xSignature: null,
        xRequestId: 'request-123',
        dataId: '12345',
        webhookSecret: 'webhook_secret',
      }),
    ).toBe(false);
  });
});
