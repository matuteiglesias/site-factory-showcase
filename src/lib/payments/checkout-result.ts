import 'server-only';

import type { Order } from '@/contracts/order';
import { prismaOrderRepository } from '@/lib/orders/prisma-order-repository';

export type CheckoutResultSearchParams = {
  order?: string;
  external_reference?: string;
  payment_id?: string;
  status?: string;
};

export type CheckoutResultOrderRepository = Pick<
  typeof prismaOrderRepository,
  'findByPublicId'
>;

export type CheckoutResultOrderStatus = {
  orderPublicId?: string;
  order?: Order;
};

export async function getCheckoutResultOrderStatus(
  searchParams: CheckoutResultSearchParams,
  orderRepository: CheckoutResultOrderRepository = prismaOrderRepository,
): Promise<CheckoutResultOrderStatus> {
  const orderPublicId = searchParams.order ?? searchParams.external_reference;

  if (!orderPublicId) {
    return {};
  }

  const order = await orderRepository.findByPublicId(orderPublicId);

  return {
    orderPublicId,
    order,
  };
}
