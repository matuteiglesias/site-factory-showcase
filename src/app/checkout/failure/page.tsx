import Link from 'next/link';

type Props = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function CheckoutFailurePage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Pago fake rechazado</h1>
      <p>El pedido debería quedar en estado payment_failed.</p>

      {order ? (
        <p>
          <Link href={`/admin/orders/${order}`}>Ver pedido en ops</Link>
        </p>
      ) : null}

      <p>
        <Link href="/templates">Volver a templates</Link>
      </p>
    </main>
  );
}
