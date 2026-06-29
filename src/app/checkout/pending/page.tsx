import Link from 'next/link';

import { CheckoutResultStatus } from '@/components/checkout/CheckoutResultStatus';
import {
  getCheckoutResultOrderStatus,
  type CheckoutResultSearchParams,
} from '@/lib/payments/checkout-result';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<CheckoutResultSearchParams>;
};

export default async function CheckoutPendingPage({ searchParams }: Props) {
  const result = await getCheckoutResultOrderStatus(await searchParams);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Pago pendiente en Mercado Pago</h1>
      <p>
        Esta página no avanza el pedido ni confirma el pago. El estado final se
        actualiza sólo después de recibir, guardar y reconciliar un webhook
        verificado.
      </p>
      <p>
        Los parámetros de redirección pueden ayudar a encontrar el pedido, pero
        no se toman como evidencia de pago.
      </p>

      <CheckoutResultStatus {...result} />

      <p>
        <Link href="/admin/orders">Ver todos los pedidos</Link>
      </p>
    </main>
  );
}
