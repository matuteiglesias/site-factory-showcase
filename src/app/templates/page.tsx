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
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Templates reales</p>
        <h1 className="page-title">Sitios profesionales listos para adaptar</h1>
        <p className="page-lede">
          Elegí un punto de partida probado, completá un brief estructurado y
          dejá un pedido listo para producción. Sin promesas mágicas: alcance
          claro, inputs claros y entrega controlada.
        </p>
      </section>

      <Suspense fallback={<p>Cargando catálogo...</p>}>
        <TemplateExplorer templates={activeTemplates} />
      </Suspense>
    </main>
  );
}
