import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '56px 24px' }}>
      <p style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 13 }}>
        Site Factory Showcase
      </p>

      <h1>Catálogo y sistema de pedidos para sitios profesionales</h1>

      <p style={{ fontSize: 18, lineHeight: 1.6 }}>
        Milestone 1: vertical slice falsa integrada. La app permite elegir un
        template, crear un pedido, pasar por checkout fake, procesar webhook fake
        y ver el pedido en ops.
      </p>

      <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
        <Link href="/templates">Ver templates</Link>
        <Link href="/pedido">Ir a pedido</Link>
        <Link href="/admin/orders">Ops</Link>
      </div>

      <section style={{ marginTop: 48 }}>
        <h2>Invariantes del sistema</h2>
        <ul>
          <li>Todo checkout debe tener una orden interna previa.</li>
          <li>El precio se calcula server-side.</li>
          <li>La URL de success no marca pagos como aprobados.</li>
          <li>Todo webhook debe guardarse antes de reconciliar.</li>
          <li>Los estados de orden pasan por una máquina de estados.</li>
        </ul>
      </section>
    </main>
  );
}
