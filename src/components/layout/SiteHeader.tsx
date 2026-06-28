import Link from 'next/link';

export default function SiteHeader() {
  const showOpsLink = process.env.NEXT_PUBLIC_SHOW_OPS_LINK === 'true';

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-neutral-50/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-black text-xs text-white">
            S
          </span>
          <span>Showcase</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-neutral-600">
          <Link className="hover:text-black" href="/templates">
            Templates
          </Link>
          <Link className="hover:text-black" href="/pedido">
            Pedir sitio
          </Link>
          {showOpsLink ? (
            <Link className="hover:text-black" href="/admin/orders">
              Ops
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
