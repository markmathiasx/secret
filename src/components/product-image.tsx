'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({
  src,
  alt,
  label,
  className = '',
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false
}: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <>
      <Image
        src={failed ? '/placeholders/product-card.svg' : src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
      {label ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-4">
          <p className="text-sm font-medium text-white/90">{label}</p>
        </div>
      ) : null}
    </>
  );
}
