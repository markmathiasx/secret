import { cn } from "@/lib/utils";
import { getLicensedVideoAsset, type LicensedVideoAssetId } from "@/lib/video-assets";

type CinematicVariant = "home" | "catalog" | "product";

type CinematicVideoBackgroundProps = {
  variant: CinematicVariant;
  className?: string;
  overlayClassName?: string;
  objectPosition?: string;
};

const variantAsset: Record<CinematicVariant, LicensedVideoAssetId> = {
  home: "hero-printer-loop",
  catalog: "process-printer-loop",
  product: "filament-detail-loop",
};

const variantFallback: Record<CinematicVariant, string> = {
  home: "bg-[radial-gradient(circle_at_18%_10%,rgba(16,185,129,0.30),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.16),transparent_26%),linear-gradient(135deg,#071016,#0e1720_54%,#111827)]",
  catalog: "bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.22),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(135deg,#071016,#0e1720_56%,#111827)]",
  product: "bg-[radial-gradient(circle_at_16%_8%,rgba(16,185,129,0.20),transparent_32%),radial-gradient(circle_at_86%_20%,rgba(99,102,241,0.16),transparent_28%),linear-gradient(135deg,#071016,#0b1320_54%,#111827)]",
};

export function CinematicVideoBackground({
  variant,
  className,
  overlayClassName,
  objectPosition = "center",
}: CinematicVideoBackgroundProps) {
  const asset = getLicensedVideoAsset(variantAsset[variant]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", variantFallback[variant], className)} aria-hidden="true">
      {asset.poster ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: `url("${asset.poster}")`, backgroundPosition: objectPosition }}
        />
      ) : null}

      {asset.src ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-70 motion-reduce:hidden"
          src={asset.src}
          poster={asset.poster ?? undefined}
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
          "absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.92),rgba(2,6,23,0.62)_46%,rgba(2,6,23,0.82)),linear-gradient(180deg,rgba(2,6,23,0.15),rgba(2,6,23,0.94))]",
          overlayClassName
        )}
      />
    </div>
  );
}
