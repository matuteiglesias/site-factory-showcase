import 'server-only';

import crypto from 'node:crypto';

import type { CreateOrderInput, Customer, Order, OrderBrief, OrderStatus } from '@/contracts/order';
import { prisma } from '@/lib/db/prisma';
import { assertCanTransitionOrder } from '@/lib/orders/order-machine';
import type {
  CreateOrderRecordInput,
  OrderRepository,
  TransitionOrderInput,
} from '@/lib/orders/order-repository';

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

export async function transitionOrderRecord(
  input: TransitionOrderInput,
): Promise<Order> {
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

export const prismaOrderRepository: OrderRepository = {
  list: listOrders,
  findByPublicId: getOrderByPublicId,
  create(input: CreateOrderRecordInput): Promise<Order> {
    return createOrderRecord(input);
  },
  transition: transitionOrderRecord,
};
