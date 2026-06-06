import { AlertTriangle } from "lucide-react";

type IndustrialErrorProps = {
  title?: string;
  message: string;
};

export function IndustrialError({ title = "Acao indisponivel", message }: IndustrialErrorProps) {
  return (
    <div className="industrial-error" role="alert">
      <AlertTriangle className="h-5 w-5 text-amber-100" />
      <div>
        <p className="font-black text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/65">{message}</p>
      </div>
    </div>
  );
}
