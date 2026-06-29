import Link from 'next/link';

import type { Order } from '@/contracts/order';

type CheckoutResultStatusProps = {
  orderPublicId?: string;
  order?: Order;
};

export function CheckoutResultStatus({
  orderPublicId,
  order,
}: CheckoutResultStatusProps) {
  if (!orderPublicId) {
    return (
      <section>
        <h2>Estado del pedido</h2>
        <p>
          No recibimos un identificador de pedido para consultar el estado
          actual.
        </p>
      </section>
    );
  }

  if (!order) {
    return (
      <section>
        <h2>Estado del pedido</h2>
        <p>No encontramos un pedido con el identificador recibido.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Estado actual del pedido</h2>
      <p>
        <strong>{order.status}</strong>
      </p>
      <p>
        Pedido <code>{order.publicId}</code> · Total registrado en servidor:{' '}
        <strong>
          {new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: order.currency,
            maximumFractionDigits: 0,
          }).format(order.amountARS)}
        </strong>
      </p>
      <p>
        <Link href={`/admin/orders/${order.publicId}`}>Ver pedido en ops</Link>
      </p>
    </section>
  );
}
