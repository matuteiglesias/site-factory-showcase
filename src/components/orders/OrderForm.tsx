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

    const orderPayload = {
      templateSlug: String(formData.get('templateSlug') ?? ''),
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

      window.location.href = `/pedido/gracias?order=${orderJson.order.publicId}`;
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }

  return (
    <form className="form-card form-grid" onSubmit={onSubmit}>
      <label className="field">
        Template elegido
        <input
          name="templateSlug"
          defaultValue={templateSlug ?? ''}
          required
          readOnly={Boolean(templateSlug)}
        />
      </label>

      <label className="field">
        Nombre
        <input name="name" required />
      </label>

      <label className="field">
        Email
        <input name="email" type="email" required />
      </label>

      <label className="field">
        WhatsApp
        <input name="whatsapp" placeholder="+54 9 ..." />
      </label>

      <label className="field">
        Nombre del negocio o profesional
        <input name="businessName" required />
      </label>

      <label className="field">
        Rubro
        <input
          name="industry"
          required
          placeholder="Psicología, educación, consultoría, pyme local..."
        />
      </label>

      <label className="field">
        Objetivo del sitio
        <textarea
          name="goal"
          required
          rows={5}
          placeholder="Qué necesitás conseguir: consultas, agenda, presentación profesional, cursos, ventas, etc."
        />
      </label>

      <label className="checkbox-row">
        <input name="hasLogo" type="checkbox" />
        Ya tengo logo
      </label>

      <label className="checkbox-row">
        <input name="hasCopy" type="checkbox" />
        Ya tengo textos preparados
      </label>

      <label className="checkbox-row">
        <input name="hasDomain" type="checkbox" />
        Ya tengo dominio
      </label>

      <label className="field">
        Notas adicionales
        <textarea
          name="notes"
          rows={4}
          placeholder="Links, referencias, urgencia, restricciones o comentarios."
        />
      </label>

      <button className="button button--primary" disabled={state.status === 'submitting'} type="submit">
        {state.status === 'submitting' ? 'Guardando pedido...' : 'Enviar pedido'}
      </button>

      {state.status === 'error' ? (
        <p style={{ color: 'crimson' }}>{state.message}</p>
      ) : null}
    </form>
  );
}
