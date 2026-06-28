import crypto from 'node:crypto';

import { createCheckoutInputSchema } from '@/contracts/payment';
import type { CreateCheckoutResult } from '@/contracts/payment';
import {
  createPaymentAttemptRecord,
  getOrderByPublicId,
  transitionOrderRecord,
} from '@/lib/fake-db/store';

function fakePreferenceId() {
  return `fake_pref_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

export async function createFakeCheckout(input: unknown): Promise<CreateCheckoutResult> {
  const parsed = createCheckoutInputSchema.parse(input);
  const order = await getOrderByPublicId(parsed.orderPublicId);

  if (!order) {
    throw new Error(`Order not found: ${parsed.orderPublicId}`);
  }

  if (!['pending_payment', 'payment_failed'].includes(order.status)) {
    throw new Error(`Order cannot start checkout from status: ${order.status}`);
  }

  let checkoutOrder = order;

  if (order.status === 'payment_failed') {
    checkoutOrder = await transitionOrderRecord({
      publicId: order.publicId,
      to: 'pending_payment',
      reason: 'retry fake checkout after failed payment',
    });
  }

  checkoutOrder = await transitionOrderRecord({
    publicId: checkoutOrder.publicId,
    to: 'payment_pending',
    reason: 'fake checkout started',
  });

  const providerPreferenceId = fakePreferenceId();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const checkoutUrl = `${baseUrl}/checkout/fake?order=${checkoutOrder.publicId}&pref=${providerPreferenceId}`;

  await createPaymentAttemptRecord({
    order: checkoutOrder,
    providerPreferenceId,
    checkoutUrl,
  });

  return {
    provider: 'mercadopago',
    orderPublicId: checkoutOrder.publicId,
    providerPreferenceId,
    checkoutUrl,
  };
}
