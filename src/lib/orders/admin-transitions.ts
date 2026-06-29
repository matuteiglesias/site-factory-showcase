import type { OrderStatus } from '@/contracts/order';

export const manualAdminTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_payment: ['cancelled'],
  ready_for_production: ['in_production'],
  in_production: ['preview_sent'],
  preview_sent: ['revision_requested', 'approved'],
  approved: ['deployed'],
  deployed: ['delivered'],
};

export function getManualAdminTransitionTargets(
  from: OrderStatus,
): OrderStatus[] {
  return manualAdminTransitions[from] ?? [];
}

export function isManualAdminTransitionAllowed(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return getManualAdminTransitionTargets(from).includes(to);
}
