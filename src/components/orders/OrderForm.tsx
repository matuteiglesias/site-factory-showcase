'use client';

import { useState } from 'react';

type Props = {
  templateSlug?: string;
};

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string };

function fieldClass() {
  return 'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black';
}

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
    <form
      className="grid max-w-3xl gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      onSubmit={onSubmit}
    >
      <label className="grid gap-2 text-sm font-medium">
        Template elegido
        <input
          className={fieldClass()}
          name="templateSlug"
          defaultValue={templateSlug ?? ''}
          required
          readOnly={Boolean(templateSlug)}
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Nombre
          <input className={fieldClass()} name="name" required />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Email
          <input className={fieldClass()} name="email" type="email" required />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          WhatsApp
          <input className={fieldClass()} name="whatsapp" placeholder="+54 9 ..." />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Rubro
          <input
            className={fieldClass()}
            name="industry"
            required
            placeholder="Psicología, educación, consultoría..."
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Nombre del negocio o profesional
        <input className={fieldClass()} name="businessName" required />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Objetivo del sitio
        <textarea
          className={fieldClass()}
          name="goal"
          required
          rows={5}
          placeholder="Qué necesitás conseguir: consultas, agenda, presentación profesional, cursos, ventas, etc."
        />
      </label>

      <div className="grid gap-3 text-sm text-neutral-600 md:grid-cols-3">
        <label className="flex items-center gap-2">
          <input name="hasLogo" type="checkbox" />
          Ya tengo logo
        </label>

        <label className="flex items-center gap-2">
          <input name="hasCopy" type="checkbox" />
          Ya tengo textos
        </label>

        <label className="flex items-center gap-2">
          <input name="hasDomain" type="checkbox" />
          Ya tengo dominio
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Notas adicionales
        <textarea
          className={fieldClass()}
          name="notes"
          rows={4}
          placeholder="Links, referencias, urgencia, restricciones o comentarios."
        />
      </label>

      <button
        className="w-fit rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        disabled={state.status === 'submitting'}
        type="submit"
      >
        {state.status === 'submitting' ? 'Guardando pedido...' : 'Enviar pedido'}
      </button>

      {state.status === 'error' ? (
        <p className="text-sm text-red-600">{state.message}</p>
      ) : null}
    </form>
  );
}
