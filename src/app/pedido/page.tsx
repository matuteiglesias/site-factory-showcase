import Link from 'next/link';

import OrderForm from '@/components/orders/OrderForm';
import { getTemplateBySlug } from '@/content/templates';

type Props = {
  searchParams: Promise<{
    template?: string;
  }>;
};

export const metadata = {
  title: 'Pedir sitio',
  description: 'Formulario inicial de pedido para un sitio profesional.',
};

export default async function PedidoPage({ searchParams }: Props) {
  const { template: templateSlug } = await searchParams;
  const template = templateSlug ? getTemplateBySlug(templateSlug) : undefined;

  return (
    <main className="page-shell">
      <Link className="button button--ghost" href="/templates">
        ← Volver a templates
      </Link>

      <section className="hero" style={{ paddingBottom: 28 }}>
        <p className="eyebrow">Brief inicial</p>
        <h1 className="page-title">Pedir sitio</h1>

        {template ? (
          <p className="page-lede">
            Template seleccionado: <strong>{template.title}</strong>. Este
            formulario crea un pedido real en base de datos con estado{' '}
            <strong>pending_payment</strong>.
          </p>
        ) : (
          <p className="page-lede">
            Elegí un template desde el catálogo o ingresá manualmente el slug.
            Este milestone todavía no cobra online.
          </p>
        )}
      </section>

      <OrderForm templateSlug={templateSlug} />
    </main>
  );
}
