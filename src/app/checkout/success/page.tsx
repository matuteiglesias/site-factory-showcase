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

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const result = await getCheckoutResultOrderStatus(await searchParams);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Pago recibido por Mercado Pago</h1>
      <p>
        Esta página es informativa: no marca el pedido como pagado ni usa los
        parámetros de la URL como comprobante de pago.
      </p>
      <p>
        La confirmación real ocurre únicamente cuando el webhook de Mercado Pago
        es validado y reconciliado contra el pago aprobado.
      </p>

      <CheckoutResultStatus {...result} />

      <p>
        <Link href="/admin/orders">Ver todos los pedidos</Link>
      </p>
    </main>
  );
}
