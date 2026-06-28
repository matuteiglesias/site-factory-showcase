import Link from 'next/link';

import OrderForm from '@/components/orders/OrderForm';

type Props = {
  searchParams: Promise<{
    template?: string;
  }>;
};

export const metadata = {
  title: 'Pedir sitio',
  description: 'Formulario inicial de pedido para un sitio profesional.',
};

export default async function PedidoPage({ searchParams }: Props) {
  const { template } = await searchParams;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/templates">← Volver a templates</Link>

      <h1>Pedir sitio</h1>
      <p>
        Vertical slice falsa: este formulario crea una orden local y te manda a
        un checkout fake.
      </p>

      <OrderForm templateSlug={template} />
    </main>
  );
}
