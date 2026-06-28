import { z } from 'zod';

export const paymentProviders = ['mercadopago'] as const;

export const providerPaymentStatuses = [
  'created',
  'pending',
  'approved',
  'authorized',
  'in_process',
  'in_mediation',
  'rejected',
  'cancelled',
  'refunded',
  'charged_back',
  'unknown',
] as const;

export const paymentProviderSchema = z.enum(paymentProviders);
export const providerPaymentStatusSchema = z.enum(providerPaymentStatuses);

export const paymentAttemptSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  orderPublicId: z.string().min(8),

  provider: paymentProviderSchema,
  providerPreferenceId: z.string().optional(),
  providerPaymentId: z.string().optional(),
  providerStatus: providerPaymentStatusSchema.optional(),

  amountARS: z.number().int().positive(),
  currency: z.literal('ARS'),

  rawResponse: z.unknown().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createCheckoutInputSchema = z.object({
  orderPublicId: z.string().min(8),
});

export const createCheckoutResultSchema = z.object({
  provider: paymentProviderSchema,
  orderPublicId: z.string().min(8),
  providerPreferenceId: z.string().min(1),
  checkoutUrl: z.string().url(),
});

export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
export type ProviderPaymentStatus = z.infer<typeof providerPaymentStatusSchema>;
export type PaymentAttempt = z.infer<typeof paymentAttemptSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutInputSchema>;
export type CreateCheckoutResult = z.infer<typeof createCheckoutResultSchema>;
