export function IndustrialLoading({ label = "Carregando operacao" }: { label?: string }) {
  return (
    <div className="industrial-loading" role="status" aria-live="polite">
      <span className="industrial-spinner" />
      <span>{label}</span>
    </div>
  );
}
