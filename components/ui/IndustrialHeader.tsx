import type { ReactNode } from "react";
import { clsx } from "clsx";

type IndustrialHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function IndustrialHeader({ eyebrow, title, description, actions, className }: IndustrialHeaderProps) {
  return (
    <header className={clsx("industrial-header", className)}>
      <div>
        {eyebrow ? <p className="industrial-eyebrow">{eyebrow}</p> : null}
        <h1 className="industrial-title">{title}</h1>
        {description ? <p className="industrial-muted mt-3 max-w-3xl">{description}</p> : null}
      </div>
      {actions ? <div className="industrial-header-actions">{actions}</div> : null}
    </header>
  );
}
