import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  listPaymentAttemptsByOrderPublicId,
  listWebhookEventsByOrderPublicId,
} from '@/lib/fake-db/store';
import { getOrderByPublicId } from '@/lib/orders/prisma-order-repository';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { publicId } = await params;

  return {
    title: `Ops — ${publicId}`,
  };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { publicId } = await params;
  const order = await getOrderByPublicId(publicId);

  if (!order) {
    notFound();
  }

  const paymentAttempts = await listPaymentAttemptsByOrderPublicId(order.publicId);
  const webhookEvents = await listWebhookEventsByOrderPublicId(order.publicId);

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/admin/orders">← Volver a pedidos</Link>

      <h1>Pedido {order.publicId}</h1>

      <section>
        <h2>Estado</h2>
        <dl>
          <dt>Status</dt>
          <dd>{order.status}</dd>

          <dt>Template</dt>
          <dd>{order.templateSlug}</dd>

          <dt>Monto</dt>
          <dd>ARS {order.amountARS.toLocaleString('es-AR')}</dd>

          <dt>Creado</dt>
          <dd>{order.createdAt}</dd>

          <dt>Actualizado</dt>
          <dd>{order.updatedAt}</dd>
        </dl>
      </section>

      <section>
        <h2>Cliente</h2>
        <dl>
          <dt>Nombre</dt>
          <dd>{order.customer.name}</dd>

          <dt>Email</dt>
          <dd>{order.customer.email}</dd>

          <dt>WhatsApp</dt>
          <dd>{order.customer.whatsapp ?? '—'}</dd>
        </dl>
      </section>

      <section>
        <h2>Brief</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(order.brief, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Payment attempts</h2>
        {paymentAttempts.length === 0 ? (
          <p>No payment attempts.</p>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(paymentAttempts, null, 2)}
          </pre>
        )}
      </section>

      <section>
        <h2>Webhook events</h2>
        {webhookEvents.length === 0 ? (
          <p>No webhook events.</p>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(webhookEvents, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
