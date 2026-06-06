import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

type IndustrialEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function IndustrialEmptyState({ title, description, action }: IndustrialEmptyStateProps) {
  return (
    <div className="industrial-empty">
      <PackageOpen className="h-8 w-8 text-cyan-100" />
      <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
      <p className="industrial-muted mt-2">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
