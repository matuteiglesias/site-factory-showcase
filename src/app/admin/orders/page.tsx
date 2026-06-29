import Link from 'next/link';

import {
  orderStatuses,
  orderStatusSchema,
  type OrderStatus,
} from '@/contracts/order';
import { templateSlugSchema } from '@/contracts/template';
import { activeTemplates } from '@/content/templates';
import { listOrders, type ListOrdersFilters } from '@/lib/orders/prisma-order-repository';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ops — Orders',
};

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ListOrdersFilters {
  const status = firstSearchParam(searchParams.status);
  const template = firstSearchParam(searchParams.template);

  return {
    status:
      status && orderStatusSchema.safeParse(status).success
        ? (status as OrderStatus)
        : undefined,
    templateSlug:
      template && templateSlugSchema.safeParse(template).success
        ? template
        : undefined,
  };
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const filters = parseFilters((await searchParams) ?? {});
  const orders = await listOrders(filters);
  const hasActiveFilters = Boolean(filters.status || filters.templateSlug);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Ops — pedidos</h1>

      <p>
        Consola interna falsa. En Milestone 1 sirve para verificar que el flujo
        completo deja una orden visible para producción.
      </p>

      <form
        method="get"
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'end',
          margin: '24px 0',
          flexWrap: 'wrap',
        }}
      >
        <label>
          <span style={{ display: 'block', fontWeight: 600 }}>Estado</span>
          <select name="status" defaultValue={filters.status ?? ''}>
            <option value="">Todos</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span style={{ display: 'block', fontWeight: 600 }}>Template</span>
          <select name="template" defaultValue={filters.templateSlug ?? ''}>
            <option value="">Todos</option>
            {activeTemplates.map((template) => (
              <option key={template.slug} value={template.slug}>
                {template.title}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Filtrar</button>
        {hasActiveFilters ? (
          <Link href="/admin/orders">Limpiar filtros</Link>
        ) : null}
      </form>

      {hasActiveFilters ? (
        <p>
          Mostrando {orders.length} pedido{orders.length === 1 ? '' : 's'}{' '}
          filtrado{orders.length === 1 ? '' : 's'}.
          {filters.status ? (
            <>
              {' '}
              Estado: <strong>{filters.status}</strong>.
            </>
          ) : null}
          {filters.templateSlug ? (
            <>
              {' '}
              Template: <strong>{filters.templateSlug}</strong>.
            </>
          ) : null}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <p>
          No hay pedidos{hasActiveFilters ? ' para esos filtros' : ' todavía'}.
        </p>
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
