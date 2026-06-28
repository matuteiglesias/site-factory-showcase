import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <section className="max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Site Factory Showcase
        </p>

        <h1 className="text-5xl font-semibold tracking-[-0.06em] text-black md:text-7xl">
          Sitios profesionales con catálogo, pedido y producción controlada
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
          Una forma simple de pedir sitios estáticos profesionales: elegís un
          template real, completás un brief y dejás un pedido estructurado para
          producción.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/templates"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Ver templates
          </Link>
          <Link
            href="/pedido"
            className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium hover:border-black"
          >
            Pedir sitio
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
          <p className="mt-2 text-neutral-600">
            El sistema separa venta, pedido, pago y producción.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['1 · Catálogo', 'Elegí un punto de partida', 'El cliente navega templates reales por rubro, formato y objetivo.'],
            ['2 · Brief', 'Pedido estructurado', 'El formulario captura inputs mínimos antes de iniciar producción.'],
            ['3 · Operación', 'Estado auditable', 'Cada pedido entra con estado, monto server-side y seguimiento interno.'],
          ].map(([eyebrow, title, body]) => (
            <article
              key={title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {eyebrow}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 leading-7 text-neutral-600">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
