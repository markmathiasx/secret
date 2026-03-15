<<<<<<< ours
<<<<<<< ours
const sections = [
  {
    title: "Dados de contato e atendimento",
    text: "A MDH 3D utiliza os dados enviados em formularios e canais de atendimento para responder orcamentos, acompanhar pedidos e organizar a operacao comercial."
  },
  {
    title: "Conta e autenticacao",
    text: "Quando o login com Google estiver ativo, os dados basicos da conta sao usados para personalizar a experiencia, salvar favoritos e acompanhar solicitacoes."
  },
  {
    title: "Pagamentos e seguranca",
    text: "Dados sensiveis de pagamento nao ficam expostos na vitrine publica. Pix e checkout operam com o minimo necessario para concluir a compra."
  },
  {
    title: "Solicitacoes",
    text: "Para revisar ou remover dados de atendimento, fale com a equipe da MDH 3D pelos canais oficiais exibidos no site."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Politica de privacidade</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
        Esta pagina resume como a MDH 3D trata dados de navegacao, atendimento e compra dentro da operacao comercial.
      </p>

      <div className="mt-8 grid gap-5">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{section.text}</p>
          </article>
        ))}
=======
=======
>>>>>>> theirs
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
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
      </div>
    </section>
  );
}
