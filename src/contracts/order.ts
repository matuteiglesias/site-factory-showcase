import { z } from 'zod';
import { templateSlugSchema } from './template';

export const orderStatuses = [
  'pending_payment',
  'payment_pending',
  'paid',
  'payment_failed',
  'input_incomplete',
  'ready_for_production',
  'in_production',
  'preview_sent',
  'revision_requested',
  'approved',
  'deployed',
  'delivered',
  'cancelled',
  'refunded',
  'disputed',
] as const;

export const orderStatusSchema = z.enum(orderStatuses);

export const customerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  whatsapp: z.string().min(6).max(40).optional(),
});

export const orderBriefSchema = z.object({
  businessName: z.string().min(2).max(160).optional(),
  industry: z.string().min(2).max(120).optional(),
  goal: z.string().min(10).max(1000),
  hasLogo: z.boolean(),
  hasCopy: z.boolean(),
  hasDomain: z.boolean(),
  notes: z.string().max(3000).optional(),
});

export const createOrderInputSchema = z.object({
  templateSlug: templateSlugSchema,
  customer: customerSchema,
  brief: orderBriefSchema,
});

export const orderSchema = z.object({
  id: z.string().min(1),
  publicId: z.string().min(8),
  templateSlug: templateSlugSchema,
  customer: customerSchema,
  brief: orderBriefSchema,
  amountARS: z.number().int().positive(),
  currency: z.literal('ARS'),
  status: orderStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type OrderBrief = z.infer<typeof orderBriefSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
export type Order = z.infer<typeof orderSchema>;
