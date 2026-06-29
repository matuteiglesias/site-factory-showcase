import type {
  CreateCheckoutResult,
  PaymentAttempt,
  PaymentProvider as PaymentProviderName,
  ProviderPaymentStatus,
} from '@/contracts/payment';
import type { Order } from '@/contracts/order';

export type CreateCheckoutForOrderInput = {
  orderPublicId: string;
};

export type CreatePaymentAttemptInput = {
  order: Order;
  providerPreferenceId: string;
  checkoutUrl: string;
  rawResponse?: unknown;
};

export type UpdateLatestPaymentAttemptStatusInput = {
  orderPublicId: string;
  providerStatus: ProviderPaymentStatus;
  providerPaymentId?: string;
};

export interface PaymentAttemptRepository {
  create(input: CreatePaymentAttemptInput): Promise<PaymentAttempt>;
  listByOrderPublicId(orderPublicId: string): Promise<PaymentAttempt[]>;
  updateLatestStatus(
    input: UpdateLatestPaymentAttemptStatusInput,
  ): Promise<PaymentAttempt | undefined>;
}

export interface PaymentProvider {
  readonly provider: PaymentProviderName;
  createCheckout(input: CreateCheckoutForOrderInput): Promise<CreateCheckoutResult>;
}
