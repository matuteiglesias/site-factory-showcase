import { Suspense } from 'react';

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
          Elegí un punto de partida probado, completá un brief estructurado y
          dejá un pedido listo para producción.
        </p>
      </section>

      <Suspense fallback={<p>Cargando catálogo...</p>}>
        <TemplateExplorer templates={activeTemplates} />
      </Suspense>
    </main>
  );
}
