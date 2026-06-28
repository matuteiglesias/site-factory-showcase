import Link from 'next/link';
import { notFound } from 'next/navigation';

import FakeCheckoutActions from '@/components/checkout/FakeCheckoutActions';
import { getOrderByPublicId } from '@/lib/orders/prisma-order-repository';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    order?: string;
    pref?: string;
  }>;
};

export default async function FakeCheckoutPage({ searchParams }: Props) {
  const { order: orderPublicId, pref } = await searchParams;

  if (!orderPublicId) {
    notFound();
  }

  const order = await getOrderByPublicId(orderPublicId);

  if (!order) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/templates">← Volver a templates</Link>

      <h1>Checkout fake</h1>

      <p>
        Esta pantalla simula Mercado Pago. No cobra dinero real. Sirve para
        validar la arquitectura end-to-end.
      </p>

      <dl>
        <dt>Order public ID</dt>
        <dd>{order.publicId}</dd>

        <dt>Preference</dt>
        <dd>{pref ?? 'sin preference id'}</dd>

        <dt>Monto</dt>
        <dd>ARS {order.amountARS.toLocaleString('es-AR')}</dd>

        <dt>Estado actual</dt>
        <dd>{order.status}</dd>
      </dl>

      <FakeCheckoutActions orderPublicId={order.publicId} />
    </main>
  );
}
