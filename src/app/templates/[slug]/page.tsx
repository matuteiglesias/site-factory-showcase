import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { activeTemplates, getTemplateBySlug } from '@/content/templates';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const ars = new Intl.NumberFormat('es-AR');

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

          <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
            El plazo corre desde que el brief y los materiales mínimos están
            completos.
          </p>

          <div className="mt-5 grid gap-3">
            <Link
              className="inline-flex justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
              href={`/pedido?template=${template.slug}`}
            >
              Pedir este template
            </Link>

            <a
              className="inline-flex justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium hover:border-black"
              href={template.demoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver demo real
            </a>
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
