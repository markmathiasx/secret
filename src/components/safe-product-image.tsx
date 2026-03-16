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
  const src = candidateList[index] || productPlaceholderSrc;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      loading="lazy"
      decoding="async"
      onLoad={() => onResolved?.(src)}
      onError={() => setIndex((prev) => (prev < candidateList.length - 1 ? prev + 1 : prev))}
    />
  );
}
