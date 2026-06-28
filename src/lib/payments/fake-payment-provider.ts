import 'server-only';

import crypto from 'node:crypto';

import type { CreateCheckoutResult } from '@/contracts/payment';
import { createPaymentAttemptRecord } from '@/lib/fake-db/store';
import { getOrderByPublicId, transitionOrderRecord } from '@/lib/orders/prisma-order-repository';
import type {
  CreateCheckoutForOrderInput,
  PaymentProvider,
} from '@/lib/payments/payment-provider';

function fakePreferenceId() {
  return `fake_pref_${crypto.randomUUID().replaceAll('-', '').slice(0, 16)}`;
}

export const fakePaymentProvider: PaymentProvider = {
  provider: 'mercadopago',

  async createCheckout(
    input: CreateCheckoutForOrderInput,
  ): Promise<CreateCheckoutResult> {
    const order = await getOrderByPublicId(input.orderPublicId);

    if (!order) {
      throw new Error(`Order not found: ${input.orderPublicId}`);
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
  },
};
