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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(preferredSrc);
    setUsingFallback(preferredSrc === placeholderSrc);
    setLoaded(false);
  }, [placeholderSrc, preferredSrc]);

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt || product.imageAlt || `${product.name} - ${product.category}`}
      loading={props.loading || "lazy"}
      decoding={props.decoding || "async"}
      data-media-source={usingFallback ? "placeholder" : "catalog"}
      data-loaded={loaded ? "true" : "false"}
      className={`${props.className || ""} transition duration-500 ease-out data-[loaded=false]:scale-[1.015] data-[loaded=false]:opacity-0 data-[loaded=true]:opacity-100`}
      onLoad={(event) => {
        setLoaded(true);
        props.onLoad?.(event);
      }}
      onError={(event) => {
        if (!usingFallback) {
          setCurrentSrc(placeholderSrc);
          setUsingFallback(true);
        }

        setLoaded(true);

        onError?.(event);
      }}
    />
  );
}
