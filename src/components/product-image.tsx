"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src: string;
  fallbackSrcs?: string[];
  alt: string;
  sizes?: string;
  priority?: boolean;
  containerClassName?: string;
  imageClassName?: string;
};

export function ProductImage({
  src,
  fallbackSrcs = [],
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  containerClassName,
  imageClassName
}: ProductImageProps) {
  const sources = useMemo(() => [src, ...fallbackSrcs].filter(Boolean), [fallbackSrcs, src]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = sources[activeIndex] || "/catalog-assets/product-concept.svg";

  return (
    <div className={cn("relative overflow-hidden bg-slate-950", containerClassName)}>
      <Image
        src={activeSrc}
        alt={alt}
        width={1200}
        height={1200}
        priority={priority}
        sizes={sizes}
        className={cn("h-full w-full object-cover", imageClassName)}
        onError={() => {
          setActiveIndex((current) => (current < sources.length - 1 ? current + 1 : current));
        }}
      />
    </div>
  );
}
