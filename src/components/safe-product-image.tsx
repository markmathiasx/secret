"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { getProductImageCandidates, productPlaceholderSrc } from "@/lib/product-images";

type Props = {
  product?: Product;
  candidates?: string[];
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onResolved?: (src: string) => void;
};

export function SafeProductImage({
  product,
  candidates,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  onResolved
}: Props) {
  const candidateList = useMemo(() => {
    if (candidates?.length) return candidates;
    if (product) return getProductImageCandidates(product);
    return [productPlaceholderSrc];
  }, [candidates, product]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidateList]);

  const src = candidateList[index] || productPlaceholderSrc;

  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={1200}
      sizes={sizes}
      priority={priority}
      className={className}
      onLoad={() => onResolved?.(src)}
      onError={() => setIndex((prev) => (prev < candidateList.length - 1 ? prev + 1 : prev))}
    />
  );
}
