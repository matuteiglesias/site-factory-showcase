import crypto from 'node:crypto';

import { z } from 'zod';

const mercadoPagoWebhookEnvSchema = z.object({
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().min(1),
});

export type MercadoPagoWebhookConfig = {
  webhookSecret: string;
};

export type MercadoPagoSignatureInput = {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
  webhookSecret: string;
};

function parseSignatureHeader(signatureHeader: string) {
  return Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=', 2);
      return [key?.trim(), value?.trim()];
    }),
  );
}

function timingSafeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function loadMercadoPagoWebhookConfig(
  env: Record<string, string | undefined> = process.env,
): MercadoPagoWebhookConfig {
  const parsed = mercadoPagoWebhookEnvSchema.parse(env);

  return {
    webhookSecret: parsed.MERCADO_PAGO_WEBHOOK_SECRET,
  };
}

export function createMercadoPagoSignature(input: {
  dataId: string;
  xRequestId: string;
  timestamp: string;
  webhookSecret: string;
}) {
  const manifest = `id:${input.dataId};request-id:${input.xRequestId};ts:${input.timestamp};`;

  return crypto
    .createHmac('sha256', input.webhookSecret)
    .update(manifest)
    .digest('hex');
}

export function validateMercadoPagoWebhookSignature(
  input: MercadoPagoSignatureInput,
): boolean {
  if (!input.xSignature || !input.xRequestId || !input.dataId) {
    return false;
  }

  const signatureParts = parseSignatureHeader(input.xSignature);
  const timestamp = signatureParts.ts;
  const receivedSignature = signatureParts.v1;

  if (!timestamp || !receivedSignature) {
    return false;
  }

  const expectedSignature = createMercadoPagoSignature({
    dataId: input.dataId,
    xRequestId: input.xRequestId,
    timestamp,
    webhookSecret: input.webhookSecret,
  });

  return timingSafeEqualHex(expectedSignature, receivedSignature);
}
