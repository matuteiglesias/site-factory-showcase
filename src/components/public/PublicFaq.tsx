const faqs = [
  {
    question: '¿Qué incluye un sitio basado en template?',
    answer:
      'Incluye la adaptación del template elegido a tu rubro, textos finales, imágenes entregadas por vos, secciones acordadas, configuración básica de contacto y una versión estática lista para publicar.',
  },
  {
    question: '¿Qué pasa después de enviar el pedido?',
    answer:
      'Revisamos el brief, confirmamos alcance, materiales faltantes y próximos pasos. Si el pedido es producible, coordinamos pago y agenda de producción por fuera del sitio.',
  },
  {
    question: '¿Cuándo empieza la entrega?',
    answer:
      'Los plazos empiezan cuando el brief, textos, datos de contacto, imágenes mínimas y confirmación comercial están completos. Si faltan materiales, primero se ordena el contenido.',
  },
  {
    question: '¿El template limita mi marca?',
    answer:
      'No. El template es un punto de partida para acelerar estructura, navegación y conversión. Se adapta contenido, tono, colores e imágenes, pero no incluye diseño personalizado ilimitado.',
  },
  {
    question: '¿Se cobra automáticamente al enviar el formulario?',
    answer:
      'No. En esta etapa el formulario solo crea un pedido para revisión. El pago se coordina después de validar el brief y confirmar que el alcance está claro.',
  },
];

export default function PublicFaq() {
  return (
    <section className="mt-20 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 md:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Preguntas frecuentes
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">
          Expectativas claras antes de empezar
        </h2>
        <p className="mt-3 leading-7 text-neutral-600">
          El objetivo es que cada pedido llegue con alcance, materiales y próximos
          pasos claros antes de iniciar producción.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <article
            key={faq.question}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold tracking-tight">{faq.question}</h3>
            <p className="mt-2 leading-7 text-neutral-600">{faq.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
