import { z } from 'zod';

import type { Order } from '@/contracts/order';
import {
  createWebhookEventRecord,
  markWebhookEventProcessed,
  updateLatestPaymentAttemptStatus,
} from '@/lib/fake-db/store';
import { getOrderByPublicId, transitionOrderRecord } from '@/lib/orders/prisma-order-repository';
import { isOrderBriefComplete } from '@/lib/orders/order-service';
import { nextStatusAfterApprovedPayment } from '@/lib/orders/order-machine';

export const fakeWebhookInputSchema = z.object({
  orderPublicId: z.string().min(8),
  providerStatus: z.enum(['approved', 'rejected', 'pending']),
});

export type FakeWebhookInput = z.infer<typeof fakeWebhookInputSchema>;

async function markApproved(order: Order): Promise<Order> {
  let updatedOrder = order;

  if (updatedOrder.status === 'payment_pending') {
    updatedOrder = await transitionOrderRecord({
      publicId: order.publicId,
      to: 'paid',
      reason: 'fake payment approved',
    });
  }

  if (updatedOrder.status === 'pending_payment') {
    updatedOrder = await transitionOrderRecord({
      publicId: order.publicId,
      to: 'paid',
      reason: 'fake payment approved',
    });
  }

  if (updatedOrder.status !== 'paid') {
    return updatedOrder;
  }

  return transitionOrderRecord({
    publicId: updatedOrder.publicId,
    to: nextStatusAfterApprovedPayment({
      briefIsComplete: isOrderBriefComplete(updatedOrder),
    }),
    reason: 'fake payment reconciled',
  });
}

async function markRejected(order: Order): Promise<Order> {
  if (order.status === 'payment_pending') {
    return transitionOrderRecord({
      publicId: order.publicId,
      to: 'payment_failed',
      reason: 'fake payment rejected',
    });
  }

  if (order.status === 'pending_payment') {
    return transitionOrderRecord({
      publicId: order.publicId,
      to: 'payment_failed',
      reason: 'fake payment rejected',
    });
  }

  return order;
}

export async function processFakeWebhook(input: unknown): Promise<{
  order: Order;
  webhookEventId: string;
}> {
  const parsed = fakeWebhookInputSchema.parse(input);

  const webhookEvent = await createWebhookEventRecord({
    providerEventId: `fake_event_${parsed.orderPublicId}_${parsed.providerStatus}`,
    topic: 'payment',
    action: `payment.${parsed.providerStatus}`,
    dataId: parsed.orderPublicId,
    rawBody: parsed,
    processingStatus: 'received',
  });

  const order = await getOrderByPublicId(parsed.orderPublicId);

  if (!order) {
    await markWebhookEventProcessed({
      webhookEventId: webhookEvent.id,
      processingStatus: 'failed',
      processingError: `Order not found: ${parsed.orderPublicId}`,
    });

    throw new Error(`Order not found: ${parsed.orderPublicId}`);
  }

  await updateLatestPaymentAttemptStatus({
    orderPublicId: order.publicId,
    providerStatus:
      parsed.providerStatus === 'approved'
        ? 'approved'
        : parsed.providerStatus === 'rejected'
          ? 'rejected'
          : 'pending',
    providerPaymentId: `fake_pay_${order.publicId}`,
  });

  const updatedOrder =
    parsed.providerStatus === 'approved'
      ? await markApproved(order)
      : parsed.providerStatus === 'rejected'
        ? await markRejected(order)
        : order;

  await markWebhookEventProcessed({
    webhookEventId: webhookEvent.id,
    processingStatus: 'processed',
  });

  return {
    order: updatedOrder,
    webhookEventId: webhookEvent.id,
  };
}
