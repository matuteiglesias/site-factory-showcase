import Link from 'next/link';

import OrderForm from '@/components/orders/OrderForm';
import { getTemplateBySlug } from '@/content/templates';

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
  const { template: templateSlug } = await searchParams;
  const template = templateSlug ? getTemplateBySlug(templateSlug) : undefined;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <Link
        className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:border-black"
        href="/templates"
      >
        ← Volver a templates
      </Link>

      <section className="my-10 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Brief inicial
        </p>

        <h1 className="text-5xl font-semibold tracking-[-0.06em] text-black md:text-7xl">
          Pedir sitio
        </h1>

        {template ? (
          <p className="mt-6 text-lg leading-8 text-neutral-600">
            Template seleccionado: <strong>{template.title}</strong>. Este
            formulario crea un pedido para revisión: no cobra automáticamente ni
            confirma producción hasta validar alcance, materiales y próximos pasos.
          </p>
        ) : (
          <p className="mt-6 text-lg leading-8 text-neutral-600">
            Elegí un template desde el catálogo o ingresá manualmente el slug.
            Revisamos el brief antes de coordinar pago y fecha de producción.
          </p>
        )}
      </section>

      <section className="mb-8 grid max-w-3xl gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-sm leading-6 text-neutral-700 md:grid-cols-3">
        <p><strong>1 · Brief:</strong> contanos objetivo, rubro y materiales disponibles.</p>
        <p><strong>2 · Revisión:</strong> confirmamos alcance y qué falta para producir.</p>
        <p><strong>3 · Pago:</strong> se coordina después de validar el pedido.</p>
      </section>

      <OrderForm templateSlug={templateSlug} />
    </main>
  );
}
