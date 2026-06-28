import { createOrderInputSchema } from '@/contracts/order';
import type { CreateOrderInput, Order } from '@/contracts/order';
import { activeTemplates, getTemplateBySlug } from '@/content/templates';
import { prismaOrderRepository } from '@/lib/orders/prisma-order-repository';

export function getActiveTemplateOrThrow(templateSlug: string) {
  const template = getTemplateBySlug(templateSlug);

  if (!template || template.status !== 'active') {
    throw new Error(`Template is not active or does not exist: ${templateSlug}`);
  }

  return template;
}

export function isOrderBriefComplete(order: Order): boolean {
  return Boolean(
    order.brief.businessName?.trim() &&
      order.brief.industry?.trim() &&
      order.brief.goal?.trim(),
  );
}

export async function createOrder(input: unknown): Promise<Order> {
  const createOrderInput: CreateOrderInput = createOrderInputSchema.parse(input);
  const template = getActiveTemplateOrThrow(createOrderInput.templateSlug);

  return prismaOrderRepository.create({
    createOrderInput,
    amountARS: template.price.amountARS,
  });
}

export function listOrderableTemplateSlugs(): string[] {
  return activeTemplates.map((template) => template.slug);
}
