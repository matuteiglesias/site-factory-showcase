'use client';

import { useState } from 'react';

type Props = {
  orderPublicId: string;
};

type ProviderStatus = 'approved' | 'rejected' | 'pending';

export default function FakeCheckoutActions({ orderPublicId }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  async function simulate(providerStatus: ProviderStatus) {
    setMessage(`Procesando fake webhook: ${providerStatus}`);

    const res = await fetch('/api/webhooks/fake', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        orderPublicId,
        providerStatus,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setMessage(json.message ?? 'Error procesando webhook fake');
      return;
    }

    if (providerStatus === 'approved') {
      window.location.href = `/checkout/success?order=${orderPublicId}`;
      return;
    }

    if (providerStatus === 'rejected') {
      window.location.href = `/checkout/failure?order=${orderPublicId}`;
      return;
    }

    window.location.href = `/checkout/pending?order=${orderPublicId}`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={() => simulate('approved')} type="button">
        Simular pago aprobado
      </button>

      <button onClick={() => simulate('rejected')} type="button">
        Simular pago rechazado
      </button>

      <button onClick={() => simulate('pending')} type="button">
        Simular pago pendiente
      </button>

      {message ? <p>{message}</p> : null}
    </div>
  );
}
