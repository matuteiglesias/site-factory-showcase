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
    <main className="page-shell">
      <Link className="button button--ghost" href="/templates">
        ← Volver al catálogo
      </Link>

      <div className="detail-layout" style={{ marginTop: 34 }}>
        <article>
          <p className="eyebrow">
            {template.format} · {template.audience.join(', ')}
          </p>

          <h1 className="page-title">{template.title}</h1>
          <p className="page-lede">{template.longDescription}</p>

          <div style={{ marginTop: 32 }}>
            <Image
              src={template.screenshot}
              alt={`Preview de ${template.title}`}
              width={1200}
              height={720}
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                borderRadius: 22,
                border: '1px solid var(--border)',
                background: 'var(--surface-soft)',
              }}
              priority
            />
          </div>

          <section className="section-heading">
            <div>
              <h2>Qué incluye</h2>
              <p>La estructura base que se adapta al cliente.</p>
            </div>
          </section>

          <ul className="check-list">
            {template.includedSections.map((section) => (
              <li key={section}>{section}</li>
            ))}
          </ul>

          <section className="section-heading">
            <div>
              <h2>Qué necesitamos</h2>
              <p>Inputs mínimos para que el pedido sea producible.</p>
            </div>
          </section>

          <ul className="check-list">
            {template.requiredInputs.map((input) => (
              <li key={input}>{input}</li>
            ))}
          </ul>
        </article>

        <aside className="detail-card">
          <h2>Resumen del paquete</h2>

          <div className="fact" style={{ marginBottom: 10 }}>
            <span>Precio desde</span>
            <strong>ARS {ars.format(template.price.amountARS)}</strong>
          </div>

          <div className="fact" style={{ marginBottom: 10 }}>
            <span>Entrega estimada</span>
            <strong>
              {template.deliveryDays.min}–{template.deliveryDays.max} días
            </strong>
          </div>

          <div className="notice" style={{ margin: '16px 0' }}>
            El plazo corre desde que el brief y materiales mínimos están
            completos.
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <Link className="button button--primary" href={`/pedido?template=${template.slug}`}>
              Pedir este template
            </Link>

            <a className="button" href={template.demoUrl} target="_blank" rel="noreferrer">
              Ver demo real
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
