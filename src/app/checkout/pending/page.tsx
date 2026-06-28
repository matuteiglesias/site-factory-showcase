import Link from 'next/link';

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function CheckoutPendingPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Pago fake pendiente</h1>
      <p>El pedido queda pendiente. Todavía no entra a producción.</p>

      {order ? (
        <p>
          <Link href={`/admin/orders/${order}`}>Ver pedido en ops</Link>
        </p>
      ) : null}

      <p>
        <Link href="/admin/orders">Ver todos los pedidos</Link>
      </p>
    </main>
  );
}
