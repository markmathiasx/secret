'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getSafeCatalogBackHref } from '@/lib/catalog-filters';

export function ProductCatalogBackLink({ className }: { className?: string }) {
  const [href, setHref] = useState('/catalogo');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setHref(getSafeCatalogBackHref(searchParams.get('from'), searchParams.get('focus')));
  }, []);

  return (
    <Link href={href} className={className}>
      <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
    </Link>
  );
}
