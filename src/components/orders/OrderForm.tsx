'use client';

import { useState } from 'react';

type Props = {
  templateSlug?: string;
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string };

export default function OrderForm({ templateSlug }: Props) {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'submitting' });

    const formData = new FormData(event.currentTarget);

    const selectedTemplate = String(formData.get('templateSlug') ?? '');

    const orderPayload = {
      templateSlug: selectedTemplate,
      customer: {
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        whatsapp: String(formData.get('whatsapp') ?? '') || undefined,
      },
      brief: {
        businessName: String(formData.get('businessName') ?? '') || undefined,
        industry: String(formData.get('industry') ?? '') || undefined,
        goal: String(formData.get('goal') ?? ''),
        hasLogo: formData.get('hasLogo') === 'on',
        hasCopy: formData.get('hasCopy') === 'on',
        hasDomain: formData.get('hasDomain') === 'on',
        notes: String(formData.get('notes') ?? '') || undefined,
      },
    };

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderJson = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderJson.message ?? 'No se pudo crear el pedido');
      }

      const checkoutRes = await fetch('/api/checkout/fake', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          orderPublicId: orderJson.order.publicId,
        }),
      });

      const checkoutJson = await checkoutRes.json();

      if (!checkoutRes.ok) {
        throw new Error(
          checkoutJson.message ?? 'No se pudo crear el checkout fake',
        );
      }

      window.location.href = checkoutJson.checkout.checkoutUrl;
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <label>
        Template slug
        <input
          name="templateSlug"
          defaultValue={templateSlug ?? ''}
          required
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <label>
        Nombre
        <input
          name="name"
          defaultValue="Cliente Demo"
          required
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          defaultValue="cliente.demo@example.com"
          required
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <label>
        WhatsApp
        <input
          name="whatsapp"
          defaultValue="+54 9 11 5555 5555"
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <label>
        Nombre del negocio/profesional
        <input
          name="businessName"
          defaultValue="Demo Profesional"
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <label>
        Rubro
        <input
          name="industry"
          defaultValue="Servicios profesionales"
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <label>
        Objetivo del sitio
        <textarea
          name="goal"
          defaultValue="Quiero validar el flujo falso completo del sistema: pedido, checkout fake, webhook fake y consola interna."
          required
          rows={5}
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <label>
        <input name="hasLogo" type="checkbox" defaultChecked /> Tiene logo
      </label>

      <label>
        <input name="hasCopy" type="checkbox" defaultChecked /> Tiene textos
      </label>

      <label>
        <input name="hasDomain" type="checkbox" /> Tiene dominio
      </label>

      <label>
        Notas
        <textarea
          name="notes"
          rows={4}
          style={{ display: 'block', width: '100%', padding: 8 }}
        />
      </label>

      <button disabled={state.status === 'submitting'} type="submit">
        {state.status === 'submitting'
          ? 'Creando pedido...'
          : 'Crear pedido y pasar a checkout fake'}
      </button>

      {state.status === 'error' ? (
        <p style={{ color: 'crimson' }}>{state.message}</p>
      ) : null}
    </form>
  );
}
