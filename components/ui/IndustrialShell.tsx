import type { ReactNode } from "react";
import { clsx } from "clsx";

type IndustrialShellProps = {
  children: ReactNode;
  className?: string;
};

export function IndustrialShell({ children, className }: IndustrialShellProps) {
  return (
    <section className={clsx("industrial-page", className)}>
      <div className="industrial-shell">{children}</div>
    </section>
  );
}
