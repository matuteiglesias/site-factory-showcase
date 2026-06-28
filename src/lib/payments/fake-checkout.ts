import { createCheckoutInputSchema } from '@/contracts/payment';
import type { CreateCheckoutResult } from '@/contracts/payment';
import { fakePaymentProvider } from '@/lib/payments/fake-payment-provider';

export async function createFakeCheckout(input: unknown): Promise<CreateCheckoutResult> {
  const parsed = createCheckoutInputSchema.parse(input);

  return fakePaymentProvider.createCheckout(parsed);
}
