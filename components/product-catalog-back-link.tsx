'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

function getSafeCatalogBackHref(from?: string | null, focus?: string | null) {
  const fallback = '/catalogo';
  if (!from || !from.startsWith('/catalogo')) return fallback;
  if (from.startsWith('//') || from.includes('://')) return fallback;
  return focus ? `${from}#produto-${encodeURIComponent(focus)}` : from;
}

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
