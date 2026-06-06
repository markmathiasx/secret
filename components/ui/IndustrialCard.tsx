import type { ReactNode } from "react";
import { clsx } from "clsx";

type IndustrialCardProps = {
  children: ReactNode;
  className?: string;
};

export function IndustrialCard({ children, className }: IndustrialCardProps) {
  return <div className={clsx("industrial-card", className)}>{children}</div>;
}
