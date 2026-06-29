import { Suspense } from 'react';

import PublicFaq from '@/components/public/PublicFaq';
import TemplateExplorer from '@/components/templates/TemplateExplorer';
import { activeTemplates } from '@/content/templates';

export const metadata = {
  title: 'Templates de sitios profesionales',
  description:
    'Galería de templates reales para profesionales, negocios pequeños y pymes.',
};

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="mb-10 max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Templates reales
        </p>

        <h1 className="text-5xl font-semibold tracking-[-0.06em] text-black md:text-7xl">
          Sitios profesionales listos para adaptar
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
          Elegí un punto de partida probado, compará qué incluye cada opción y
          dejá un pedido listo para revisión. El pago se coordina recién después
          de validar alcance y materiales.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            ['1', 'Elegí estructura', 'El template define secciones, tono y objetivo inicial.'],
            ['2', 'Completá brief', 'Contanos rubro, objetivo, materiales disponibles y referencias.'],
            ['3', 'Revisamos alcance', 'Confirmamos próximos pasos antes de cobrar o producir.'],
          ].map(([step, title, body]) => (
            <article key={step} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-neutral-500">Paso {step}</span>
              <h2 className="mt-2 font-semibold tracking-tight">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <Suspense fallback={<p>Cargando catálogo...</p>}>
        <TemplateExplorer templates={activeTemplates} />
      </Suspense>

      <PublicFaq />
    </main>
  );
}
