import Link from 'next/link';
import { activeTemplates, featuredTemplates } from '@/content/templates';

export const metadata = {
  title: 'Templates de sitios profesionales',
  description:
    'Galería de templates para profesionales, negocios pequeños y pymes.',
};

export default function TemplatesPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Templates de sitios profesionales</h1>
      <p>
        Catálogo inicial para validar rubros, paquetes y flujo de pedido.
      </p>

      <section style={{ marginTop: 32 }}>
        <h2>Destacados</h2>
        <ul>
          {featuredTemplates.map((template) => (
            <li key={template.slug}>
              <Link href={`/templates/${template.slug}`}>
                {template.title}
              </Link>{' '}
              — desde ARS {template.price.amountARS.toLocaleString('es-AR')}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Todos</h2>
        <ul>
          {activeTemplates.map((template) => (
            <li key={template.slug}>
              <Link href={`/templates/${template.slug}`}>
                {template.title}
              </Link>{' '}
              — {template.shortDescription}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
