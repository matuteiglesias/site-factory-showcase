import { getOrderByPublicId } from '@/lib/orders/prisma-order-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function GET(_req: Request, { params }: Props) {
  const { publicId } = await params;
  const order = await getOrderByPublicId(publicId);

  if (!order) {
    return Response.json({ error: 'order_not_found' }, { status: 404 });
  }

  return Response.json({ order });
}
