import 'server-only';

import crypto from 'node:crypto';

import type { CreateOrderInput, Order, OrderBrief, Customer, OrderStatus } from '@/contracts/order';
import type { PaymentAttempt, ProviderPaymentStatus } from '@/contracts/payment';
import type { WebhookEvent } from '@/contracts/webhook';
import { assertCanTransitionOrder } from '@/lib/orders/order-machine';
import { prisma } from '@/lib/db/prisma';

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value);
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function toIso(value: Date): string {
  return value.toISOString();
}

type OrderRecord = Awaited<ReturnType<typeof prisma.orderRecord.findFirst>>;

function mapOrder(record: NonNullable<OrderRecord>): Order {
  return {
    id: record.id,
    publicId: record.publicId,
    templateSlug: record.templateSlug,
    customer: parseJson<Customer>(record.customerJson),
    brief: parseJson<OrderBrief>(record.briefJson),
    amountARS: record.amountARS,
    currency: 'ARS',
    status: record.status as OrderStatus,
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  };
}

type PaymentAttemptRecord = Awaited<
  ReturnType<typeof prisma.paymentAttemptRecord.findFirst>
>;

function mapPaymentAttempt(
  record: NonNullable<PaymentAttemptRecord>,
): PaymentAttempt {
  return {
    id: record.id,
    orderId: record.orderId,
    orderPublicId: record.orderPublicId,
    provider: 'mercadopago',
    providerPreferenceId: record.providerPreferenceId ?? undefined,
    providerPaymentId: record.providerPaymentId ?? undefined,
    providerStatus: record.providerStatus
      ? (record.providerStatus as ProviderPaymentStatus)
      : undefined,
    amountARS: record.amountARS,
    currency: 'ARS',
    rawResponse: record.rawResponseJson
      ? parseJson<unknown>(record.rawResponseJson)
      : undefined,
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  };
}

type WebhookEventRecord = Awaited<
  ReturnType<typeof prisma.webhookEventRecord.findFirst>
>;

function mapWebhookEvent(record: NonNullable<WebhookEventRecord>): WebhookEvent {
  return {
    id: record.id,
    provider: 'mercadopago',
    providerEventId: record.providerEventId ?? undefined,
    topic: record.topic ?? undefined,
    action: record.action ?? undefined,
    dataId: record.dataId ?? undefined,
    xRequestId: record.xRequestId ?? undefined,
    xSignature: record.xSignature ?? undefined,
    rawBody: parseJson<unknown>(record.rawBodyJson),
    processingStatus: record.processingStatus as WebhookEvent['processingStatus'],
    processingError: record.processingError ?? undefined,
    createdAt: toIso(record.createdAt),
    processedAt: record.processedAt ? toIso(record.processedAt) : undefined,
  };
}

export async function resetFakeDb(): Promise<void> {
  await prisma.webhookEventRecord.deleteMany();
  await prisma.paymentAttemptRecord.deleteMany();
  await prisma.orderRecord.deleteMany();
}

export async function listOrders(): Promise<Order[]> {
  const records = await prisma.orderRecord.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return records.map(mapOrder);
}

export async function getOrderByPublicId(
  publicId: string,
): Promise<Order | undefined> {
  const record = await prisma.orderRecord.findUnique({
    where: {
      publicId,
    },
  });

  return record ? mapOrder(record) : undefined;
}

export async function createOrderRecord(input: {
  createOrderInput: CreateOrderInput;
  amountARS: number;
}): Promise<Order> {
  const record = await prisma.orderRecord.create({
    data: {
      id: id('order'),
      publicId: id('ord'),
      templateSlug: input.createOrderInput.templateSlug,
      customerJson: stringifyJson(input.createOrderInput.customer),
      briefJson: stringifyJson(input.createOrderInput.brief),
      amountARS: input.amountARS,
      currency: 'ARS',
      status: 'pending_payment',
    },
  });

  return mapOrder(record);
}

export async function transitionOrderRecord(input: {
  publicId: string;
  to: OrderStatus;
  reason: string;
}): Promise<Order> {
  const current = await getOrderByPublicId(input.publicId);

  if (!current) {
    throw new Error(`Order not found: ${input.publicId}`);
  }

  assertCanTransitionOrder(current.status, input.to);

  const record = await prisma.orderRecord.update({
    where: {
      publicId: input.publicId,
    },
    data: {
      status: input.to,
    },
  });

  return mapOrder(record);
}

export async function createPaymentAttemptRecord(input: {
  order: Order;
  providerPreferenceId: string;
  checkoutUrl: string;
  rawResponse?: unknown;
}): Promise<PaymentAttempt> {
  const record = await prisma.paymentAttemptRecord.create({
    data: {
      id: id('payatt'),
      orderId: input.order.id,
      orderPublicId: input.order.publicId,
      provider: 'mercadopago',
      providerPreferenceId: input.providerPreferenceId,
      providerStatus: 'pending',
      amountARS: input.order.amountARS,
      currency: 'ARS',
      rawResponseJson: stringifyJson(
        input.rawResponse ?? {
          fake: true,
          checkoutUrl: input.checkoutUrl,
        },
      ),
    },
  });

  return mapPaymentAttempt(record);
}

export async function listPaymentAttemptsByOrderPublicId(
  orderPublicId: string,
): Promise<PaymentAttempt[]> {
  const records = await prisma.paymentAttemptRecord.findMany({
    where: {
      orderPublicId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return records.map(mapPaymentAttempt);
}

export async function updateLatestPaymentAttemptStatus(input: {
  orderPublicId: string;
  providerStatus: ProviderPaymentStatus;
  providerPaymentId?: string;
}): Promise<PaymentAttempt | undefined> {
  const latest = await prisma.paymentAttemptRecord.findFirst({
    where: {
      orderPublicId: input.orderPublicId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!latest) {
    return undefined;
  }

  const record = await prisma.paymentAttemptRecord.update({
    where: {
      id: latest.id,
    },
    data: {
      providerStatus: input.providerStatus,
      providerPaymentId: input.providerPaymentId ?? latest.providerPaymentId,
    },
  });

  return mapPaymentAttempt(record);
}

export async function createWebhookEventRecord(input: {
  providerEventId?: string;
  topic?: string;
  action?: string;
  dataId?: string;
  xRequestId?: string;
  xSignature?: string;
  rawBody: unknown;
  processingStatus?: WebhookEvent['processingStatus'];
  processingError?: string;
}): Promise<WebhookEvent> {
  const order = input.dataId
    ? await prisma.orderRecord.findUnique({
        where: {
          publicId: input.dataId,
        },
      })
    : null;

  const record = await prisma.webhookEventRecord.create({
    data: {
      id: id('wh'),
      orderPublicId: order?.publicId,
      provider: 'mercadopago',
      providerEventId: input.providerEventId,
      topic: input.topic,
      action: input.action,
      dataId: input.dataId,
      xRequestId: input.xRequestId,
      xSignature: input.xSignature,
      rawBodyJson: stringifyJson(input.rawBody),
      processingStatus: input.processingStatus ?? 'received',
      processingError: input.processingError,
    },
  });

  return mapWebhookEvent(record);
}

export async function markWebhookEventProcessed(input: {
  webhookEventId: string;
  processingStatus: WebhookEvent['processingStatus'];
  processingError?: string;
}): Promise<WebhookEvent | undefined> {
  const existing = await prisma.webhookEventRecord.findUnique({
    where: {
      id: input.webhookEventId,
    },
  });

  if (!existing) {
    return undefined;
  }

  const record = await prisma.webhookEventRecord.update({
    where: {
      id: input.webhookEventId,
    },
    data: {
      processingStatus: input.processingStatus,
      processingError: input.processingError,
      processedAt: new Date(),
    },
  });

  return mapWebhookEvent(record);
}

export async function listWebhookEventsByOrderPublicId(
  orderPublicId: string,
): Promise<WebhookEvent[]> {
  const records = await prisma.webhookEventRecord.findMany({
    where: {
      OR: [
        {
          orderPublicId,
        },
        {
          dataId: orderPublicId,
        },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return records.map(mapWebhookEvent);
}
