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
            formulario crea un pedido real en base de datos con estado{' '}
            <strong>pending_payment</strong>.
          </p>
        ) : (
          <p className="mt-6 text-lg leading-8 text-neutral-600">
            Elegí un template desde el catálogo o ingresá manualmente el slug.
            Este milestone todavía no cobra online.
          </p>
        )}
      </section>

      <OrderForm templateSlug={templateSlug} />
    </main>
  );
}
