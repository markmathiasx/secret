const actions = ["Ver catalogo", "Fazer orcamento", "Prazo de producao", "Presentes ate R$50", "Falar com humano", "Ver ofertas", "Peca sob medida"];

export function MdhAiQuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button key={action} type="button" className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">
          {action}
        </button>
      ))}
    </div>
  );
}
