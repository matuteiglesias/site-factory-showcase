import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Site Factory Showcase</p>
        <h1>Sitios profesionales con catálogo, pedido y producción controlada</h1>
        <p>
          Una forma simple de pedir sitios estáticos profesionales: elegís un
          template real, completás un brief y dejás un pedido estructurado para
          producción. El foco es reducir ambigüedad, retrabajo y entregas
          improvisadas.
        </p>

        <div className="hero-actions">
          <Link className="button button--primary" href="/templates">
            Ver templates
          </Link>
          <Link className="button" href="/pedido">
            Pedir sitio
          </Link>
          <Link className="button button--ghost" href="/admin/orders">
            Ops
          </Link>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <h2>Cómo funciona</h2>
          <p>El sistema separa venta, pedido, pago y producción.</p>
        </div>
      </section>

      <div className="template-grid">
        <article className="template-card">
          <div className="template-card__body">
            <span className="badge">1 · Catálogo</span>
            <h3>Elegí un punto de partida</h3>
            <p>
              El cliente navega templates reales por rubro, formato y objetivo.
            </p>
          </div>
        </article>

        <article className="template-card">
          <div className="template-card__body">
            <span className="badge">2 · Brief</span>
            <h3>Pedido estructurado</h3>
            <p>
              El formulario captura inputs mínimos antes de iniciar producción.
            </p>
          </div>
        </article>

        <article className="template-card">
          <div className="template-card__body">
            <span className="badge">3 · Operación</span>
            <h3>Estado auditable</h3>
            <p>
              Cada pedido entra con estado, monto server-side y seguimiento
              interno.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
