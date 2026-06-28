import type { OrderStatus } from '@/contracts/order';

export const allowedOrderTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['payment_pending', 'paid', 'payment_failed', 'cancelled'],
  payment_pending: ['paid', 'payment_failed', 'cancelled'],
  payment_failed: ['pending_payment', 'cancelled'],

  paid: ['input_incomplete', 'ready_for_production', 'refunded', 'disputed'],
  input_incomplete: ['ready_for_production', 'cancelled', 'refunded'],
  ready_for_production: ['in_production', 'cancelled', 'refunded'],

  in_production: ['preview_sent', 'cancelled', 'refunded'],
  preview_sent: ['revision_requested', 'approved', 'cancelled', 'refunded'],
  revision_requested: ['in_production', 'approved', 'cancelled', 'refunded'],
  approved: ['deployed', 'cancelled', 'refunded'],
  deployed: ['delivered'],
  delivered: ['refunded', 'disputed'],

  cancelled: [],
  refunded: [],
  disputed: ['refunded'],
};

export function canTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return allowedOrderTransitions[from].includes(to);
}

export function assertCanTransitionOrder(
  from: OrderStatus,
  to: OrderStatus,
): void {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Invalid order transition: ${from} -> ${to}`);
  }
}

export function nextStatusAfterApprovedPayment(input: {
  briefIsComplete: boolean;
}): OrderStatus {
  return input.briefIsComplete ? 'ready_for_production' : 'input_incomplete';
}
