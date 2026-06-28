import { z } from 'zod';

export const webhookProcessingStatuses = [
  'received',
  'processed',
  'ignored',
  'failed',
] as const;

export const webhookProcessingStatusSchema = z.enum(webhookProcessingStatuses);

export const webhookEventSchema = z.object({
  id: z.string().min(1),
  provider: z.literal('mercadopago'),

  providerEventId: z.string().optional(),
  topic: z.string().optional(),
  action: z.string().optional(),
  dataId: z.string().optional(),

  xRequestId: z.string().optional(),
  xSignature: z.string().optional(),

  rawBody: z.unknown(),

  processingStatus: webhookProcessingStatusSchema,
  processingError: z.string().optional(),

  createdAt: z.string().datetime(),
  processedAt: z.string().datetime().optional(),
});

export type WebhookProcessingStatus = z.infer<
  typeof webhookProcessingStatusSchema
>;

export type WebhookEvent = z.infer<typeof webhookEventSchema>;
