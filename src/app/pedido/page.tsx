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
  const { template } = await searchParams;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <h1>Pedir sitio</h1>
      <p>
        Template seleccionado:{' '}
        <strong>{template ?? 'ninguno seleccionado'}</strong>
      </p>
      <p>
        Próximo milestone: formulario validado, creación de order y estado
        pending_payment.
      </p>
    </main>
  );
}
