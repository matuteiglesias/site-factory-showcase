import Link from 'next/link';

import { listOrders } from '@/lib/orders/prisma-order-repository';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ops — Orders',
};

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Ops — pedidos</h1>

      <p>
        Consola interna falsa. En Milestone 1 sirve para verificar que el flujo
        completo deja una orden visible para producción.
      </p>

      {orders.length === 0 ? (
        <p>No hay pedidos todavía.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Pedido</th>
              <th align="left">Template</th>
              <th align="left">Cliente</th>
              <th align="left">Estado</th>
              <th align="right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.publicId}>
                <td style={{ padding: '8px 0' }}>
                  <Link href={`/admin/orders/${order.publicId}`}>
                    {order.publicId}
                  </Link>
                </td>
                <td>{order.templateSlug}</td>
                <td>{order.customer.email}</td>
                <td>{order.status}</td>
                <td align="right">
                  ARS {order.amountARS.toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 32 }}>
        <Link href="/templates">Volver al catálogo</Link>
      </p>
    </main>
  );
}
