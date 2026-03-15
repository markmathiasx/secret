"use client";

import { useEffect, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { makeProductPlaceholder, getProductImageSrc, type ProductMediaLike } from "@/lib/product-media";

type ProductMediaImageProps = Omit<ComponentPropsWithoutRef<"img">, "src" | "alt"> & {
  product: ProductMediaLike;
  src?: string | null;
  alt?: string;
};

export function ProductMediaImage({ product, src, alt, onError, ...props }: ProductMediaImageProps) {
  const placeholderSrc = useMemo(
    () => makeProductPlaceholder(product),
    [product.category, product.name, product.sku]
  );
  const preferredSrc = src || getProductImageSrc(product);
  const [currentSrc, setCurrentSrc] = useState(preferredSrc);
  const [usingFallback, setUsingFallback] = useState(preferredSrc === placeholderSrc);

  useEffect(() => {
    setCurrentSrc(preferredSrc);
    setUsingFallback(preferredSrc === placeholderSrc);
  }, [placeholderSrc, preferredSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt || product.imageAlt || `${product.name} - ${product.category}`}
      loading={props.loading || "lazy"}
      decoding={props.decoding || "async"}
      data-media-source={usingFallback ? "placeholder" : "catalog"}
      onError={(event) => {
        if (!usingFallback) {
          setCurrentSrc(placeholderSrc);
          setUsingFallback(true);
        }

        onError?.(event);
      }}
    />
  );
}
