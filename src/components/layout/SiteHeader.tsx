import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-brand" href="/">
          <span className="site-brand__mark">S</span>
          <span>Showcase</span>
        </Link>

        <nav className="site-nav" aria-label="Principal">
          <Link href="/templates">Templates</Link>
          <Link href="/pedido">Pedir sitio</Link>
          <Link href="/admin/orders">Ops</Link>
        </nav>
      </div>
    </header>
  );
}
