import type { ReactNode } from "react";
import { clsx } from "clsx";

type IndustrialSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function IndustrialSection({ title, description, children, className }: IndustrialSectionProps) {
  return (
    <section className={clsx("industrial-section", className)}>
      {title || description ? (
        <div className="mb-5">
          {title ? <h2 className="text-xl font-black text-white">{title}</h2> : null}
          {description ? <p className="industrial-muted mt-2">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
