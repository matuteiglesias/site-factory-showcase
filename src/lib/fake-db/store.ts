import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import type { CreateOrderInput, Order, OrderStatus } from '@/contracts/order';
import type { PaymentAttempt, ProviderPaymentStatus } from '@/contracts/payment';
import type { WebhookEvent } from '@/contracts/webhook';
import { assertCanTransitionOrder } from '@/lib/orders/order-machine';

type FakeDb = {
  orders: Order[];
  paymentAttempts: PaymentAttempt[];
  webhookEvents: WebhookEvent[];
};

const dbDir = path.join(process.cwd(), '.local', 'fake-db');
const dbFile = path.join(dbDir, 'db.json');

const emptyDb: FakeDb = {
  orders: [],
  paymentAttempts: [],
  webhookEvents: [],
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

async function ensureDb(): Promise<void> {
  await mkdir(dbDir, { recursive: true });

  try {
    await readFile(dbFile, 'utf8');
  } catch {
    await writeFile(dbFile, JSON.stringify(emptyDb, null, 2));
  }
}

export async function readFakeDb(): Promise<FakeDb> {
  await ensureDb();

  const raw = await readFile(dbFile, 'utf8');

  if (!raw.trim()) {
    return emptyDb;
  }

  return JSON.parse(raw) as FakeDb;
}

export async function writeFakeDb(db: FakeDb): Promise<void> {
  await ensureDb();
  await writeFile(dbFile, JSON.stringify(db, null, 2));
}

export async function resetFakeDb(): Promise<void> {
  await writeFakeDb(emptyDb);
}

export async function listOrders(): Promise<Order[]> {
  const db = await readFakeDb();
  return [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrderByPublicId(
  publicId: string,
): Promise<Order | undefined> {
  const db = await readFakeDb();
  return db.orders.find((order) => order.publicId === publicId);
}

export async function createOrderRecord(input: {
  createOrderInput: CreateOrderInput;
  amountARS: number;
}): Promise<Order> {
  const db = await readFakeDb();
  const timestamp = nowIso();

  const order: Order = {
    id: id('order'),
    publicId: id('ord'),
    templateSlug: input.createOrderInput.templateSlug,
    customer: input.createOrderInput.customer,
    brief: input.createOrderInput.brief,
    amountARS: input.amountARS,
    currency: 'ARS',
    status: 'pending_payment',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.orders.push(order);
  await writeFakeDb(db);

  return order;
}

export async function transitionOrderRecord(input: {
  publicId: string;
  to: OrderStatus;
  reason: string;
}): Promise<Order> {
  const db = await readFakeDb();
  const order = db.orders.find((candidate) => candidate.publicId === input.publicId);

  if (!order) {
    throw new Error(`Order not found: ${input.publicId}`);
  }

  assertCanTransitionOrder(order.status, input.to);

  order.status = input.to;
  order.updatedAt = nowIso();

  await writeFakeDb(db);
  return order;
}

export async function createPaymentAttemptRecord(input: {
  order: Order;
  providerPreferenceId: string;
  checkoutUrl: string;
}): Promise<PaymentAttempt> {
  const db = await readFakeDb();
  const timestamp = nowIso();

  const attempt: PaymentAttempt = {
    id: id('payatt'),
    orderId: input.order.id,
    orderPublicId: input.order.publicId,
    provider: 'mercadopago',
    providerPreferenceId: input.providerPreferenceId,
    providerStatus: 'pending',
    amountARS: input.order.amountARS,
    currency: 'ARS',
    rawResponse: {
      fake: true,
      checkoutUrl: input.checkoutUrl,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  db.paymentAttempts.push(attempt);
  await writeFakeDb(db);

  return attempt;
}

export async function listPaymentAttemptsByOrderPublicId(
  orderPublicId: string,
): Promise<PaymentAttempt[]> {
  const db = await readFakeDb();
  return db.paymentAttempts.filter(
    (attempt) => attempt.orderPublicId === orderPublicId,
  );
}

export async function updateLatestPaymentAttemptStatus(input: {
  orderPublicId: string;
  providerStatus: ProviderPaymentStatus;
  providerPaymentId?: string;
}): Promise<PaymentAttempt | undefined> {
  const db = await readFakeDb();

  const attempts = db.paymentAttempts.filter(
    (attempt) => attempt.orderPublicId === input.orderPublicId,
  );

  const latest = attempts.at(-1);

  if (!latest) {
    return undefined;
  }

  latest.providerStatus = input.providerStatus;
  latest.providerPaymentId = input.providerPaymentId ?? latest.providerPaymentId;
  latest.updatedAt = nowIso();

  await writeFakeDb(db);
  return latest;
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
  const db = await readFakeDb();
  const timestamp = nowIso();

  const event: WebhookEvent = {
    id: id('wh'),
    provider: 'mercadopago',
    providerEventId: input.providerEventId,
    topic: input.topic,
    action: input.action,
    dataId: input.dataId,
    xRequestId: input.xRequestId,
    xSignature: input.xSignature,
    rawBody: input.rawBody,
    processingStatus: input.processingStatus ?? 'received',
    processingError: input.processingError,
    createdAt: timestamp,
  };

  db.webhookEvents.push(event);
  await writeFakeDb(db);

  return event;
}

export async function markWebhookEventProcessed(input: {
  webhookEventId: string;
  processingStatus: WebhookEvent['processingStatus'];
  processingError?: string;
}): Promise<WebhookEvent | undefined> {
  const db = await readFakeDb();

  const event = db.webhookEvents.find(
    (candidate) => candidate.id === input.webhookEventId,
  );

  if (!event) {
    return undefined;
  }

  event.processingStatus = input.processingStatus;
  event.processingError = input.processingError;
  event.processedAt = nowIso();

  await writeFakeDb(db);
  return event;
}

export async function listWebhookEventsByOrderPublicId(
  orderPublicId: string,
): Promise<WebhookEvent[]> {
  const db = await readFakeDb();

  return db.webhookEvents.filter((event) => {
    if (event.dataId === orderPublicId) {
      return true;
    }

    if (
      typeof event.rawBody === 'object' &&
      event.rawBody !== null &&
      'orderPublicId' in event.rawBody
    ) {
      return event.rawBody.orderPublicId === orderPublicId;
    }

    return false;
  });
}
