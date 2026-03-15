"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

<<<<<<< ours
<<<<<<< ours
export function ProductImage({
  src,
  alt,
  label,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false
}: Props) {
=======
export function ProductImage({ src, alt, label, className = "", sizes = "(max-width: 768px) 100vw, 33vw", priority = false }: Props) {
>>>>>>> theirs
=======
export function ProductImage({ src, alt, label, className = "", sizes = "(max-width: 768px) 100vw, 33vw", priority = false }: Props) {
>>>>>>> theirs
  const [failed, setFailed] = useState(false);

  return (
    <>
      <Image
<<<<<<< ours
<<<<<<< ours
        src={failed ? "/placeholders/product-card.svg" : src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
=======
=======
>>>>>>> theirs
      src={failed ? "/catalog-assets/placeholder-product.svg" : src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
      {failed && label ? (
        <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-black/10 to-transparent p-3">
          <p className="line-clamp-2 text-xs font-medium text-white/90">{label}</p>
        </div>
      ) : null}
    </>
  );
}
