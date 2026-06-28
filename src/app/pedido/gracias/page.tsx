import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getOrderByPublicId } from '@/lib/orders/prisma-order-repository';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function PedidoGraciasPage({ searchParams }: Props) {
  const { order: orderPublicId } = await searchParams;

  if (!orderPublicId) {
    notFound();
  }

  const order = await getOrderByPublicId(orderPublicId);

  if (!order) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Pedido recibido</p>
        <h1>Ya tenemos tu brief inicial</h1>
        <p>
          Tu pedido quedó registrado con estado <strong>{order.status}</strong>.
          El próximo paso operativo es revisar el brief y coordinar pago o
          producción.
        </p>

        <div className="notice" style={{ marginTop: 24 }}>
          ID del pedido: <strong>{order.publicId}</strong>
        </div>

        <div className="hero-actions">
          <Link className="button button--primary" href={`/admin/orders/${order.publicId}`}>
            Ver pedido en ops
          </Link>
          <Link className="button" href="/templates">
            Volver al catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}
