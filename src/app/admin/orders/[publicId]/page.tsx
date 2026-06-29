import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { orderStatusSchema } from '@/contracts/order';
import {
  getManualAdminTransitionTargets,
  isManualAdminTransitionAllowed,
} from '@/lib/orders/admin-transitions';
import {
  listPaymentAttemptsByOrderPublicId,
  listWebhookEventsByOrderPublicId,
} from '@/lib/fake-db/store';
import {
  getBriefMissingFields,
  isOrderBriefComplete,
} from '@/lib/orders/brief-completeness';
import {
  getOrderByPublicId,
  transitionOrderRecord,
} from '@/lib/orders/prisma-order-repository';

export const dynamic = 'force-dynamic';

const productionChecklistItems = [
  'brief reviewed',
  'assets received',
  'copy reviewed',
  'preview created',
  'revision handled',
  'deploy delivered',
];

type Props = {
  params: Promise<{
    publicId: string;
  }>;
  searchParams?: Promise<{
    transition_error?: string;
  }>;
};

async function transitionOrderAction(formData: FormData) {
  'use server';

  const publicId = String(formData.get('publicId') ?? '');
  const parsedStatus = orderStatusSchema.safeParse(formData.get('to'));
  const order = await getOrderByPublicId(publicId);

  if (!publicId || !parsedStatus.success || !order) {
    redirect(`/admin/orders/${publicId}?transition_error=invalid_request`);
  }

  if (!isManualAdminTransitionAllowed(order.status, parsedStatus.data)) {
    redirect(`/admin/orders/${publicId}?transition_error=transition_not_allowed`);
  }

  try {
    await transitionOrderRecord({
      publicId,
      to: parsedStatus.data,
      reason: 'Manual admin transition from ops detail',
    });
  } catch {
    redirect(`/admin/orders/${publicId}?transition_error=transition_failed`);
  }

  redirect(`/admin/orders/${publicId}`);
}

export async function generateMetadata({ params }: Props) {
  const { publicId } = await params;

  return {
    title: `Ops — ${publicId}`,
  };
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: Props) {
  const { publicId } = await params;
  const { transition_error: transitionError } = (await searchParams) ?? {};
  const order = await getOrderByPublicId(publicId);

  if (!order) {
    notFound();
  }

  const paymentAttempts = await listPaymentAttemptsByOrderPublicId(order.publicId);
  const webhookEvents = await listWebhookEventsByOrderPublicId(order.publicId);
  const isBriefComplete = isOrderBriefComplete(order);
  const missingBriefFields = getBriefMissingFields(order);
  const allowedNextStatuses = getManualAdminTransitionTargets(order.status);

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
        <h2>Acciones ops</h2>
        {transitionError ? (
          <p role="alert">
            No se pudo aplicar la transición ({transitionError}). Verificá el
            estado actual y volvé a intentar.
          </p>
        ) : null}

        <h3>Próximos estados permitidos</h3>
        {allowedNextStatuses.length === 0 ? (
          <p>No hay transiciones manuales disponibles para este estado.</p>
        ) : (
          <ul>
            {allowedNextStatuses.map((status) => (
              <li key={status}>
                <form action={transitionOrderAction}>
                  <input type="hidden" name="publicId" value={order.publicId} />
                  <input type="hidden" name="to" value={status} />
                  <button type="submit">Mover a {status}</button>
                </form>
              </li>
            ))}
          </ul>
        )}
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
        <dl>
          <dt>Completitud</dt>
          <dd>{isBriefComplete ? 'Completo' : 'Incompleto'}</dd>

          <dt>Campos faltantes</dt>
          <dd>
            {missingBriefFields.length === 0 ? (
              '—'
            ) : (
              <ul>
                {missingBriefFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            )}
          </dd>
        </dl>

        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(order.brief, null, 2)}
        </pre>
      </section>

      <section>
        <h2>Production checklist</h2>
        <p>Checklist estático para seguimiento interno; no se persiste todavía.</p>
        <ul>
          {productionChecklistItems.map((item) => (
            <li key={item}>
              <label>
                <input type="checkbox" disabled /> {item}
              </label>
            </li>
          ))}
        </ul>
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
