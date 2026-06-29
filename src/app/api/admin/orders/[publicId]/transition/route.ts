import { z } from 'zod';

import { orderStatusSchema } from '@/contracts/order';
import { isManualAdminTransitionAllowed } from '@/lib/orders/admin-transitions';
import {
  getOrderByPublicId,
  transitionOrderRecord,
} from '@/lib/orders/prisma-order-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const transitionRequestSchema = z
  .object({
    to: orderStatusSchema,
    reason: z.string().min(3).max(500).optional(),
  })
  .strict();

type Props = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function POST(req: Request, { params }: Props) {
  const { publicId } = await params;
  const order = await getOrderByPublicId(publicId);

  if (!order) {
    return Response.json({ error: 'order_not_found' }, { status: 404 });
  }

  const parsed = transitionRequestSchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: 'invalid_transition_request' }, { status: 400 });
  }

  if (!isManualAdminTransitionAllowed(order.status, parsed.data.to)) {
    return Response.json(
      {
        error: 'transition_not_allowed',
        from: order.status,
        to: parsed.data.to,
      },
      { status: 409 },
    );
  }

  try {
    const transitionedOrder = await transitionOrderRecord({
      publicId,
      to: parsed.data.to,
      reason: parsed.data.reason ?? 'Manual admin transition',
    });

    return Response.json({ order: transitionedOrder });
  } catch {
    return Response.json(
      {
        error: 'transition_not_allowed',
        from: order.status,
        to: parsed.data.to,
      },
      { status: 409 },
    );
  }
}
