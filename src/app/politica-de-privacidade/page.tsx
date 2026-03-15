const items = [
  "Coletamos dados mínimos para orçamento, produção, entrega e suporte.",
  "Dados de pagamento sensíveis são processados por provedores especializados.",
  "Dados de conta ficam protegidos por autenticação e políticas de acesso no banco.",
  "Você pode solicitar atualização ou remoção dos dados de contato quando desejar."
];

export default function Page() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
        <p>A MDH 3D trata suas informações com foco em segurança, transparência e uso estritamente comercial para atendimento do pedido.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
