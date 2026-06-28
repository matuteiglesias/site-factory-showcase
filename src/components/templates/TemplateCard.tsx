import Image from 'next/image';
import Link from 'next/link';

import type { Template } from '@/contracts/template';

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

export default function TemplateCard({ template }: { template: Template }) {
  return (
    <article className="template-card">
      <Link
        className="template-card__media"
        href={`/templates/${template.slug}`}
        aria-label={`Ver ${template.title}`}
      >
        <Image
          src={template.screenshot}
          alt={`Preview de ${template.title}`}
          width={1200}
          height={720}
          priority={template.featured}
        />
      </Link>

      <div className="template-card__body">
        <div className="template-card__meta">
          <span className="badge">{formatLabels[template.format] ?? template.format}</span>
          {template.audience.slice(0, 2).map((audience) => (
            <span className="badge" key={audience}>
              {audienceLabels[audience] ?? audience}
            </span>
          ))}
        </div>

        <h2>{template.title}</h2>
        <p>{template.shortDescription}</p>

        <div className="template-card__facts">
          <div className="fact">
            <span>Desde</span>
            <strong>ARS {ars.format(template.price.amountARS)}</strong>
          </div>
          <div className="fact">
            <span>Entrega</span>
            <strong>
              {template.deliveryDays.min}–{template.deliveryDays.max} días
            </strong>
          </div>
        </div>

        <div className="template-card__actions">
          <Link className="button" href={`/templates/${template.slug}`}>
            Ver ficha
          </Link>
          <a className="button button--ghost" href={template.demoUrl} target="_blank" rel="noreferrer">
            Demo
          </a>
          <Link className="button button--primary" href={`/pedido?template=${template.slug}`}>
            Pedir
          </Link>
        </div>
      </div>
    </article>
  );
}
