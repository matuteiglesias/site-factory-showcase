import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTemplateBySlug, activeTemplates } from '@/content/templates';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

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
    title: template.title,
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
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      <Link href="/templates">← Volver a templates</Link>

      <h1>{template.title}</h1>
      <p>{template.longDescription}</p>

      <p>
        <strong>Precio:</strong> desde ARS{' '}
        {template.price.amountARS.toLocaleString('es-AR')}
      </p>

      <p>
        <strong>Entrega estimada:</strong> {template.deliveryDays.min}–
        {template.deliveryDays.max} días desde input completo.
      </p>

      <h2>Incluye</h2>
      <ul>
        {template.includedSections.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ul>

      <h2>Necesitamos del cliente</h2>
      <ul>
        {template.requiredInputs.map((input) => (
          <li key={input}>{input}</li>
        ))}
      </ul>

      <p style={{ marginTop: 32 }}>
        <Link href={`/pedido?template=${template.slug}`}>
          Pedir este template
        </Link>
      </p>
    </main>
  );
}
