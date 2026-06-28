import { ZodError } from 'zod';

import { createOrder } from '@/lib/orders/order-service';
import { listOrders } from '@/lib/fake-db/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const orders = await listOrders();
  return Response.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = await createOrder(body);

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: 'invalid_order_input',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error: 'create_order_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    );
  }
}
