import { ZodError } from 'zod';

import {
  createWebhookEventRecord,
  markWebhookEventProcessed,
} from '@/lib/fake-db/store';
import { reconcileMercadoPagoPaymentApproval } from '@/lib/payments/mercadopago-reconciliation';
import {
  loadMercadoPagoWebhookConfig,
  validateMercadoPagoWebhookSignature,
} from '@/lib/webhooks/mercadopago-signature';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getMercadoPagoDataId(url: URL) {
  return (
    url.searchParams.get('data.id') ??
    url.searchParams.get('data_id') ??
    url.searchParams.get('id')
  );
}

function parseJsonOrKeepRaw(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

function readStringField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const fieldValue = (value as Record<string, unknown>)[key];
  return typeof fieldValue === 'string' ? fieldValue : undefined;
}

function readNestedDataId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const data = (value as Record<string, unknown>).data;

  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const id = (data as Record<string, unknown>).id;

  if (typeof id === 'string') {
    return id;
  }

  if (typeof id === 'number') {
    return String(id);
  }

  return undefined;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const dataId = getMercadoPagoDataId(url);
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  let config;

  try {
    config = loadMercadoPagoWebhookConfig();
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: 'missing_mercado_pago_webhook_config',
          message: 'Mercado Pago webhook signature configuration is missing.',
        },
        { status: 500 },
      );
    }

    throw error;
  }

  const signatureIsValid = validateMercadoPagoWebhookSignature({
    xSignature,
    xRequestId,
    dataId,
    webhookSecret: config.webhookSecret,
  });

  if (!signatureIsValid) {
    return Response.json({ error: 'invalid_signature' }, { status: 401 });
  }

  const rawBody = await req.text();
  const parsedBody = parseJsonOrKeepRaw(rawBody);
  const providerEventId = readStringField(parsedBody, 'id');
  const action = readStringField(parsedBody, 'action');
  const topic = readStringField(parsedBody, 'type') ?? readStringField(parsedBody, 'topic');

  const webhookEvent = await createWebhookEventRecord({
    providerEventId,
    topic: url.searchParams.get('topic') ?? url.searchParams.get('type') ?? topic,
    action,
    dataId: dataId ?? readNestedDataId(parsedBody),
    xRequestId: xRequestId ?? undefined,
    xSignature: xSignature ?? undefined,
    rawBody,
    processingStatus: 'received',
  });

  try {
    if ((url.searchParams.get('type') ?? topic) === 'payment' && dataId) {
      await reconcileMercadoPagoPaymentApproval({
        providerPaymentId: dataId,
      });
    }

    await markWebhookEventProcessed({
      webhookEventId: webhookEvent.id,
      processingStatus: 'processed',
    });
  } catch (error) {
    await markWebhookEventProcessed({
      webhookEventId: webhookEvent.id,
      processingStatus: 'failed',
      processingError: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return Response.json({ received: true }, { status: 202 });
}
