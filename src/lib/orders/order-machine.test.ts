import { describe, expect, it } from 'vitest';
import {
  assertCanTransitionOrder,
  canTransitionOrder,
  nextStatusAfterApprovedPayment,
} from './order-machine';

describe('order-machine', () => {
  it('allows pending_payment -> paid', () => {
    expect(canTransitionOrder('pending_payment', 'paid')).toBe(true);
  });

  it('rejects pending_payment -> delivered', () => {
    expect(canTransitionOrder('pending_payment', 'delivered')).toBe(false);
    expect(() =>
      assertCanTransitionOrder('pending_payment', 'delivered'),
    ).toThrow(/Invalid order transition/);
  });

  it('routes approved payments depending on brief completeness', () => {
    expect(nextStatusAfterApprovedPayment({ briefIsComplete: true })).toBe(
      'ready_for_production',
    );

    expect(nextStatusAfterApprovedPayment({ briefIsComplete: false })).toBe(
      'input_incomplete',
    );
  });
});
