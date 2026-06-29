import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import TrackOnView from '@/components/analytics/TrackOnView';
import TrackedExternalLink from '@/components/analytics/TrackedExternalLink';
import { activeTemplates, getTemplateBySlug } from '@/content/templates';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const ars = new Intl.NumberFormat('es-AR');

const complexityLabels = {
  simple: 'Simple',
  standard: 'Estándar',
  advanced: 'Avanzado',
} as const;

export function generateStaticParams() {
  return activeTemplates.map((template) => ({
    slug: template.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template || template.status !== 'active') {
    return {};
  }

  return {
    title: `${template.title} | Template profesional`,
    description: template.shortDescription,
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template || template.status !== 'active') {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <TrackOnView
        name="template_detail_viewed"
        payload={{ templateSlug: template.slug }}
      />
      <Link
        href="/templates"
        className="inline-flex rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:border-black"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
            {template.format} · {template.audience.join(', ')}
          </p>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-black md:text-7xl">
            {template.title}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
            {template.longDescription}
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
            <Image
              src={template.screenshot}
              alt={`Preview de ${template.title}`}
              width={1200}
              height={720}
              className="h-auto w-full"
              priority
            />
          </div>

          <section className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <span className="text-sm text-neutral-500">Mejor para</span>
                <p className="mt-2 font-medium leading-7 text-neutral-800">
                  {template.bestFor}
                </p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Objetivo principal</span>
                <p className="mt-2 font-medium leading-7 text-neutral-800">
                  {template.primaryGoal}
                </p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Complejidad</span>
                <p className="mt-2 font-medium leading-7 text-neutral-800">
                  {complexityLabels[template.complexity]}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Recomendado para
              </h2>
              <ul className="mt-5 grid gap-3">
                {template.recommendedFor.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-green-950">
                    <span className="font-semibold text-green-700">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                No es ideal para
              </h2>
              <ul className="mt-5 grid gap-3">
                {template.notIdealFor.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-amber-950">
                    <span className="font-semibold text-amber-700">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Qué incluye
              </h2>
              <p className="mt-2 text-neutral-600">
                La estructura base que se adapta al cliente.
              </p>
            </div>

            <ul className="grid gap-3">
              {template.includedSections.map((section) => (
                <li
                  key={section}
                  className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-neutral-700 shadow-sm"
                >
                  <span className="font-semibold text-green-700">✓</span>
                  <span>{section}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Qué necesitamos
              </h2>
              <p className="mt-2 text-neutral-600">
                Inputs mínimos para que el pedido sea producible.
              </p>
            </div>

            <ul className="grid gap-3">
              {template.requiredInputs.map((input) => (
                <li
                  key={input}
                  className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-neutral-700 shadow-sm"
                >
                  <span className="font-semibold text-green-700">✓</span>
                  <span>{input}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold tracking-tight">
            Resumen del paquete
          </h2>

          <div className="mt-5 grid gap-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <span className="block text-sm text-neutral-500">
                Precio desde
              </span>
              <strong className="mt-1 block text-lg">
                ARS {ars.format(template.price.amountARS)}
              </strong>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <span className="block text-sm text-neutral-500">
                Entrega estimada
              </span>
              <strong className="mt-1 block text-lg">
                {template.deliveryDays.min}–{template.deliveryDays.max} días
              </strong>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
              El plazo corre desde que el brief y los materiales mínimos están
              completos.
            </p>
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Enviar el pedido no cobra automáticamente: primero revisamos alcance,
              materiales y confirmación comercial.
            </p>
            <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
              El template acelera la producción, pero no equivale a diseño
              personalizado ilimitado.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <Link
              className="inline-flex justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              href={`/pedido?template=${template.slug}`}
            >
              Pedir este template
            </Link>

            <TrackedExternalLink
              className="inline-flex justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium hover:border-black"
              href={template.demoUrl}
              target="_blank"
              rel="noreferrer"
              eventName="template_demo_clicked"
              eventPayload={{ templateSlug: template.slug, source: 'detail' }}
            >
              Ver demo real
            </TrackedExternalLink>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold">Tags</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
