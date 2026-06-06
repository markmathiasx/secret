import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function IndustrialInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx("industrial-input", className)} {...props} />;
}
