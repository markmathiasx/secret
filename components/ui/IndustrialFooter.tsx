import type { ReactNode } from "react";
import { clsx } from "clsx";

type IndustrialFooterProps = {
  children: ReactNode;
  className?: string;
};

export function IndustrialFooter({ children, className }: IndustrialFooterProps) {
  return <footer className={clsx("industrial-footer", className)}>{children}</footer>;
}
