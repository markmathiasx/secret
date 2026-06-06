import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type IndustrialButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "primary" | "secondary" | "danger";
};

export function IndustrialButton({ children, className, tone = "primary", ...props }: IndustrialButtonProps) {
  return (
    <button className={clsx("industrial-button", `industrial-button-${tone}`, className)} {...props}>
      {children}
    </button>
  );
}
