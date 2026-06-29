'use client';

import { useRef, useState } from 'react';

import { trackAnalyticsEvent } from '@/lib/analytics/events';

type Props = {
  templateSlug?: string;
};

type FieldErrors = Partial<
  Record<
    | 'templateSlug'
    | 'name'
    | 'email'
    | 'whatsapp'
    | 'industry'
    | 'businessName'
    | 'goal'
    | 'notes',
    string
  >
>;

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string; fieldErrors: FieldErrors };

type OrderErrorResponse = {
  message?: string;
  fieldErrors?: FieldErrors;
  issues?: string[];
};

const minLengths = {
  templateSlug: 3,
  name: 2,
  email: 3,
  whatsapp: 6,
  industry: 2,
  businessName: 2,
  goal: 10,
} as const;

function fieldClass(hasError = false) {
  return hasError
    ? 'w-full rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm outline-none focus:border-red-600'
    : 'w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black';
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs font-medium text-red-600">{message}</p>;
}

function buildFallbackMessage(errorJson: OrderErrorResponse) {
  if (errorJson.message) return errorJson.message;
  if (errorJson.issues?.length) return errorJson.issues.join(' ');

  return 'No se pudo crear el pedido. Revisá los campos marcados e intentá nuevamente.';
}

export default function OrderForm({ templateSlug }: Props) {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const hasTrackedStart = useRef(false);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : {};

  function trackFormStarted() {
    if (hasTrackedStart.current) return;

    hasTrackedStart.current = true;
    trackAnalyticsEvent({
      name: 'order_form_started',
      payload: { templateSlug: templateSlug ?? null },
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'submitting' });
    trackAnalyticsEvent({
      name: 'order_form_submitted',
      payload: { templateSlug: templateSlug ?? null },
    });

    const formData = new FormData(event.currentTarget);

    const orderPayload = {
      templateSlug: String(formData.get('templateSlug') ?? '').trim(),
      customer: {
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        whatsapp: String(formData.get('whatsapp') ?? '').trim() || undefined,
      },
      brief: {
        businessName: String(formData.get('businessName') ?? '').trim(),
        industry: String(formData.get('industry') ?? '').trim(),
        goal: String(formData.get('goal') ?? '').trim(),
        hasLogo: formData.get('hasLogo') === 'on',
        hasCopy: formData.get('hasCopy') === 'on',
        hasDomain: formData.get('hasDomain') === 'on',
        notes: String(formData.get('notes') ?? '').trim() || undefined,
      },
    };

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderJson = (await orderRes.json()) as
        | { order: { publicId: string } }
        | OrderErrorResponse;

      if (!orderRes.ok) {
        const errorJson = orderJson as OrderErrorResponse;

        setState({
          status: 'error',
          message: buildFallbackMessage(errorJson),
          fieldErrors: errorJson.fieldErrors ?? {},
        });
        return;
      }

      const successJson = orderJson as { order: { publicId: string } };
      window.location.href = `/pedido/gracias?order=${successJson.order.publicId}`;
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Error de conexión al crear el pedido.',
        fieldErrors: {},
      });
    }
  }

  return (
    <form
      className="grid max-w-3xl gap-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      onSubmit={onSubmit}
      noValidate
      onFocusCapture={trackFormStarted}
    >
      <label className="grid gap-2 text-sm font-medium">
        Template elegido
        <input
          className={fieldClass(Boolean(fieldErrors.templateSlug))}
          name="templateSlug"
          defaultValue={templateSlug ?? ''}
          minLength={minLengths.templateSlug}
          required
          readOnly={Boolean(templateSlug)}
        />
        <FieldError message={fieldErrors.templateSlug} />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Nombre
          <input
            className={fieldClass(Boolean(fieldErrors.name))}
            name="name"
            minLength={minLengths.name}
            required
          />
          <FieldError message={fieldErrors.name} />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className={fieldClass(Boolean(fieldErrors.email))}
            name="email"
            type="email"
            required
          />
          <FieldError message={fieldErrors.email} />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          WhatsApp
          <input
            className={fieldClass(Boolean(fieldErrors.whatsapp))}
            name="whatsapp"
            minLength={minLengths.whatsapp}
            placeholder="+54 9 ..."
          />
          <FieldError message={fieldErrors.whatsapp} />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Rubro
          <input
            className={fieldClass(Boolean(fieldErrors.industry))}
            name="industry"
            minLength={minLengths.industry}
            required
            placeholder="Psicología, educación, consultoría..."
          />
          <FieldError message={fieldErrors.industry} />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Nombre del negocio o profesional
        <input
          className={fieldClass(Boolean(fieldErrors.businessName))}
          name="businessName"
          minLength={minLengths.businessName}
          required
        />
        <FieldError message={fieldErrors.businessName} />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Objetivo del sitio
        <textarea
          className={fieldClass(Boolean(fieldErrors.goal))}
          name="goal"
          minLength={minLengths.goal}
          required
          rows={5}
          placeholder="Qué necesitás conseguir: consultas, agenda, presentación profesional, cursos, ventas, etc."
        />
        <FieldError message={fieldErrors.goal} />
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
          className={fieldClass(Boolean(fieldErrors.notes))}
          name="notes"
          rows={4}
          placeholder="Links, referencias, urgencia, restricciones o comentarios."
        />
        <FieldError message={fieldErrors.notes} />
      </label>

      {state.status === 'error' ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <strong className="block">No pudimos guardar el pedido</strong>
          <span>{state.message}</span>
        </div>
      ) : null}

      <button
        className="w-fit rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        disabled={state.status === 'submitting'}
        type="submit"
      >
        {state.status === 'submitting' ? 'Guardando pedido...' : 'Enviar pedido'}
      </button>
    </form>
  );
}
