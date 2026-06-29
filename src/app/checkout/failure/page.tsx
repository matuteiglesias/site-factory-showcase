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

export default async function CheckoutFailurePage({ searchParams }: Props) {
  const result = await getCheckoutResultOrderStatus(await searchParams);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Pago no completado en Mercado Pago</h1>
      <p>
        Esta página no cambia el estado del pedido. Un rechazo, cancelación o
        error sólo se registra después de reconciliar eventos verificados del
        proveedor.
      </p>
      <p>
        Los parámetros de la URL se usan únicamente para consultar el pedido, no
        como prueba de pago o rechazo.
      </p>

      <CheckoutResultStatus {...result} />

      <p>
        <Link href="/templates">Volver a templates</Link>
      </p>
    </main>
  );
}
