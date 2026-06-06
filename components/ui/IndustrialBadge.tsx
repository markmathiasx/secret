import type { ReactNode } from "react";
import { clsx } from "clsx";
import { industrialToneClass, type IndustrialTone } from "@/lib/design/industrial-tokens";

type IndustrialBadgeProps = {
  children: ReactNode;
  tone?: IndustrialTone;
  className?: string;
};

export function IndustrialBadge({ children, tone = "slate", className }: IndustrialBadgeProps) {
  return <span className={clsx("industrial-badge", industrialToneClass[tone], className)}>{children}</span>;
}
