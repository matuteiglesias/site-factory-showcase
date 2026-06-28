import type { Metadata } from 'next';

import SiteHeader from '@/components/layout/SiteHeader';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: 'Showcase — sitios profesionales',
    template: '%s | Showcase',
  },
  description:
    'Catálogo de templates reales para producir sitios profesionales estáticos con pedido estructurado.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
