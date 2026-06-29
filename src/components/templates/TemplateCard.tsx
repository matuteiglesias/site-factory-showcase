'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Template } from '@/contracts/template';
import { trackAnalyticsEvent } from '@/lib/analytics/events';

const ars = new Intl.NumberFormat('es-AR');

const audienceLabels: Record<string, string> = {
  psychology: 'Psicología',
  health: 'Salud',
  education: 'Educación',
  consulting: 'Consultoría',
  legal: 'Legal',
  local_business: 'Pyme',
  restaurant: 'Gastronomía',
  portfolio: 'Portfolio',
};

const formatLabels: Record<string, string> = {
  landing: 'Landing',
  institutional: 'Institucional',
  docs: 'Docs',
  portfolio: 'Portfolio',
};

const complexityLabels: Record<Template['complexity'], string> = {
  simple: 'Simple',
  standard: 'Estándar',
  advanced: 'Avanzado',
};

export default function TemplateCard({ template }: { template: Template }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <Link href={`/templates/${template.slug}`} className="block border-b border-neutral-200 bg-neutral-100">
        <Image
          src={template.screenshot}
          alt={`Preview de ${template.title}`}
          width={1200}
          height={720}
          className="h-auto w-full"
          priority={template.featured}
        />
      </Link>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            {formatLabels[template.format] ?? template.format}
          </span>
          {template.audience.slice(0, 2).map((audience) => (
            <span
              key={audience}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500"
            >
              {audienceLabels[audience] ?? audience}
            </span>
          ))}
        </div>

        <h2 className="text-lg font-semibold tracking-tight">{template.title}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {template.shortDescription}
        </p>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <span className="block text-xs text-neutral-500">Objetivo principal</span>
          <strong className="mt-1 block text-sm leading-5">
            {template.primaryGoal}
          </strong>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <span className="block text-xs text-neutral-500">Desde</span>
            <strong className="mt-1 block text-sm">
              ARS {ars.format(template.price.amountARS)}
            </strong>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <span className="block text-xs text-neutral-500">Entrega</span>
            <strong className="mt-1 block text-sm">
              {template.deliveryDays.min}–{template.deliveryDays.max} días
            </strong>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
          <span className="block text-xs text-neutral-500">Ideal para</span>
          <p className="mt-1 text-sm leading-5 text-neutral-700">{template.bestFor}</p>
          <span className="mt-3 inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            Complejidad {complexityLabels[template.complexity]}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/templates/${template.slug}`}
            className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:border-black"
          >
            Ver ficha
          </Link>
          <a
            href={template.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:border-black"
            onClick={() =>
              trackAnalyticsEvent({
                name: 'template_demo_clicked',
                payload: { templateSlug: template.slug, source: 'card' },
              })
            }
          >
            Demo
          </a>
          <Link
            href={`/pedido?template=${template.slug}`}
            className="rounded-full bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Pedir
          </Link>
        </div>
      </div>
    </article>
  );
}
