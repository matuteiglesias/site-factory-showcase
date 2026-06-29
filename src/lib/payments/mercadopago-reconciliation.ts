import 'server-only';

import { z } from 'zod';

import type { Order } from '@/contracts/order';
import type { PaymentAttempt } from '@/contracts/payment';
import { providerPaymentStatusSchema } from '@/contracts/payment';
import type { OrderRepository } from '@/lib/orders/order-repository';
import { nextStatusAfterApprovedPayment } from '@/lib/orders/order-machine';
import { isOrderBriefComplete } from '@/lib/orders/order-service';
import { prismaOrderRepository } from '@/lib/orders/prisma-order-repository';
import {
  updateLatestPaymentAttemptStatus,
} from '@/lib/fake-db/store';
import type { PaymentAttemptRepository } from '@/lib/payments/payment-provider';
import {
  loadMercadoPagoProviderConfig,
  type MercadoPagoProviderConfig,
} from '@/lib/payments/mercadopago-provider';

const mercadoPagoPaymentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  status: providerPaymentStatusSchema,
  external_reference: z.string().min(1),
  transaction_amount: z.number(),
  currency_id: z.string().min(1),
});

type MercadoPagoFetch = (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
) => Promise<Response>;

export type ReconcileMercadoPagoPaymentInput = {
  providerPaymentId: string;
};

export type ReconcileMercadoPagoPaymentDependencies = {
  orderRepository: Pick<OrderRepository, 'findByPublicId' | 'transition'>;
  paymentAttemptRepository: Pick<PaymentAttemptRepository, 'updateLatestStatus'>;
  fetch: MercadoPagoFetch;
};

export type ReconcileMercadoPagoPaymentResult = {
  order: Order;
  paymentAttempt?: PaymentAttempt;
  providerPaymentId: string;
};

const defaultPaymentAttemptRepository: Pick<
  PaymentAttemptRepository,
  'updateLatestStatus'
> = {
  updateLatestStatus: updateLatestPaymentAttemptStatus,
};

function getDefaultDependencies(): ReconcileMercadoPagoPaymentDependencies {
  return {
    orderRepository: prismaOrderRepository,
    paymentAttemptRepository: defaultPaymentAttemptRepository,
    fetch: globalThis.fetch,
  };
}

function normalizeProviderPaymentId(value: string | number) {
  return String(value);
}

async function fetchMercadoPagoPayment(input: {
  providerPaymentId: string;
  config: MercadoPagoProviderConfig;
  fetch: MercadoPagoFetch;
}) {
  const response = await input.fetch(
    `https://api.mercadopago.com/v1/payments/${input.providerPaymentId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${input.config.accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Mercado Pago payment fetch failed: ${response.status}`);
  }

  return mercadoPagoPaymentSchema.parse(await response.json());
}

function assertPaymentMatchesOrder(input: {
  payment: z.infer<typeof mercadoPagoPaymentSchema>;
  order: Order;
}) {
  if (input.payment.status !== 'approved') {
    throw new Error(
      `Mercado Pago payment is not approved: ${input.payment.status}`,
    );
  }

  if (input.payment.external_reference !== input.order.publicId) {
    throw new Error('Mercado Pago payment external reference does not match order.');
  }

  if (input.payment.transaction_amount !== input.order.amountARS) {
    throw new Error('Mercado Pago payment amount does not match order amount.');
  }

  if (input.payment.currency_id !== input.order.currency) {
    throw new Error('Mercado Pago payment currency does not match order currency.');
  }
}

async function transitionAfterApprovedPayment(input: {
  order: Order;
  orderRepository: Pick<OrderRepository, 'transition'>;
}) {
  let updatedOrder = input.order;

  if (
    updatedOrder.status === 'pending_payment' ||
    updatedOrder.status === 'payment_pending'
  ) {
    updatedOrder = await input.orderRepository.transition({
      publicId: updatedOrder.publicId,
      to: 'paid',
      reason: 'Mercado Pago payment approved',
    });
  }

  if (updatedOrder.status !== 'paid') {
    return updatedOrder;
  }

  return input.orderRepository.transition({
    publicId: updatedOrder.publicId,
    to: nextStatusAfterApprovedPayment({
      briefIsComplete: isOrderBriefComplete(updatedOrder),
    }),
    reason: 'Mercado Pago payment reconciled',
  });
}

export async function reconcileMercadoPagoPaymentApproval(
  input: ReconcileMercadoPagoPaymentInput,
  config: MercadoPagoProviderConfig = loadMercadoPagoProviderConfig(),
  dependencies: ReconcileMercadoPagoPaymentDependencies = getDefaultDependencies(),
): Promise<ReconcileMercadoPagoPaymentResult> {
  const payment = await fetchMercadoPagoPayment({
    providerPaymentId: input.providerPaymentId,
    config,
    fetch: dependencies.fetch,
  });

  const providerPaymentId = normalizeProviderPaymentId(payment.id);

  if (providerPaymentId !== input.providerPaymentId) {
    throw new Error('Mercado Pago payment id does not match requested payment.');
  }

  const order = await dependencies.orderRepository.findByPublicId(
    payment.external_reference,
  );

  if (!order) {
    throw new Error(`Order not found: ${payment.external_reference}`);
  }

  assertPaymentMatchesOrder({ payment, order });

  if (
    order.status !== 'pending_payment' &&
    order.status !== 'payment_pending' &&
    order.status !== 'paid'
  ) {
    return {
      order,
      providerPaymentId,
    };
  }

  const paymentAttempt = await dependencies.paymentAttemptRepository.updateLatestStatus({
    orderPublicId: order.publicId,
    providerStatus: 'approved',
    providerPaymentId,
  });

  const updatedOrder = await transitionAfterApprovedPayment({
    order,
    orderRepository: dependencies.orderRepository,
  });

  return {
    order: updatedOrder,
    paymentAttempt,
    providerPaymentId,
  };
}
