'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/catalog';
import { getProductImageCandidates, productPlaceholderSrc } from '@/lib/product-images';

type Props = {
  product?: Product;
  candidates?: string[];
  alt: string;
  className?: string;
  onResolved?: (src: string) => void;
};

export function SafeProductImage({ product, candidates, alt, className, onResolved }: Props) {
  const candidateList = useMemo(() => {
    if (candidates?.length) return candidates;
    if (product) return getProductImageCandidates(product);
    return [productPlaceholderSrc];
  }, [candidates, product]);

  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const src = candidateList[index] || productPlaceholderSrc;

  return (
    <>
      {isLoading && (
        <div className={`${className} animate-pulse bg-white/5 flex items-center justify-center`}>
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={1200}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        quality={85}
        onLoad={() => {
          setIsLoading(false);
          onResolved?.(src);
        }}
        onError={() => setIndex((prev) => (prev < candidateList.length - 1 ? prev + 1 : prev))}
      />
    </>
  );
}
