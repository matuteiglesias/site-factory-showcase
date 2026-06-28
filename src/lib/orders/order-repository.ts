import type { CreateOrderInput, Order, OrderStatus } from '@/contracts/order';

export type CreateOrderRecordInput = {
  createOrderInput: CreateOrderInput;
  amountARS: number;
};

export type TransitionOrderInput = {
  publicId: string;
  to: OrderStatus;
  reason: string;
};

export interface OrderRepository {
  list(): Promise<Order[]>;
  findByPublicId(publicId: string): Promise<Order | undefined>;
  create(input: CreateOrderRecordInput): Promise<Order>;
  transition(input: TransitionOrderInput): Promise<Order>;
}
