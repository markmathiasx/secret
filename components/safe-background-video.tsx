"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SafeBackgroundVideoProps = {
  src?: string | null;
  poster?: string | null;
  className?: string;
  videoClassName?: string;
  overlayClassName?: string;
  fallbackClassName?: string;
  objectPosition?: string;
};

export function SafeBackgroundVideo({
  src,
  poster,
  className,
  videoClassName,
  overlayClassName,
  fallbackClassName,
  objectPosition = "center",
}: SafeBackgroundVideoProps) {
  const shouldReduceMotion = useReducedMotion();
  const showVideo = Boolean(src) && !shouldReduceMotion;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {poster ? (
        <div
          className={cn("absolute inset-0 bg-cover bg-center", showVideo ? "opacity-0" : "opacity-100", fallbackClassName)}
          style={{ backgroundImage: `url("${poster}")`, backgroundPosition: objectPosition }}
        />
      ) : (
        <div className={cn("mdh-cad-fallback absolute inset-0", fallbackClassName)} />
      )}

      {!poster ? <div className="mdh-cad-fallback-lines absolute inset-0" /> : null}

      {showVideo ? (
        <video
          className={cn("absolute inset-0 h-full w-full object-cover", videoClassName)}
          src={src ?? undefined}
          poster={poster ?? undefined}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          style={{ objectPosition }}
        />
      ) : null}

      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88),rgba(2,6,23,0.46)_46%,rgba(2,6,23,0.76))]",
          overlayClassName
        )}
      />
    </div>
  );
}
