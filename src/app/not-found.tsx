import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px' }}>
      <h1>Página no encontrada</h1>
      <p>La ruta solicitada no existe o el template no está activo.</p>
      <Link href="/templates">Volver a templates</Link>
    </main>
  );
}
