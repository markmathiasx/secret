import type { SupportIntent } from "@/lib/support/support-types";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function has(text: string, pattern: RegExp) {
  return pattern.test(text);
}

export function classifySupportIntent(message: string): SupportIntent {
  const text = normalizeText(message);

  if (has(text, /\b(oi|ola|olá|bom dia|boa tarde|boa noite|e ai|e aí)\b/)) return "saudacao";
  if (has(text, /(humano|atendente|pessoa|whatsapp|zap|falar com alguem|falar com alguém|suporte humano)/)) return "humano";
  if (has(text, /(rastre|rastrei|codigo de rastreio|código de rastreio|correios|transportadora)/)) return "rastreio";
  if (has(text, /(status.*pedido|pedido.*status|meu pedido|acompanhar pedido|numero do pedido|número do pedido)/)) return "status_pedido";
  if (has(text, /(troca|devolu|reembolso|garantia|arrependimento)/)) return "troca_devolucao";
  if (has(text, /(frete|envio|entrega|entregar|retirada|transport)/)) return "envio";
  if (has(text, /(pix.*cart|cart.*pix|cartao|cartão|credito|crédito|debito|débito)/)) return "pix_cartao";
  if (has(text, /(pagamento|pagar|mercado pago|checkout)/)) return "pagamento";
  if (has(text, /(prazo|tempo|demora|produ[cç][aã]o|quando fica|quando entrega)/)) return "prazo";
  if (has(text, /(material|pla|petg|resina|silk|acabamento|resistencia|resistência)/)) return "material";
  if (has(text, /(or[cç]amento|sob medida|stl|obj|3mf|referencia|referência|projeto|personaliz)/)) return "personalizado";
  if (has(text, /(lote|brinde|lembrancinha|quantidade|atacado|evento|corporativo)/)) return "lote_brinde";
  if (has(text, /(chaveiro|keychain|pingente|tag)/)) return "chaveiro";
  if (has(text, /(presente|barato.*presente|lembran[cç]a|gift)/)) return "presente";
  if (has(text, /(mais caro|maior pre[cç]o|premium|topo de linha)/)) return "produto_caro";
  if (has(text, /(barato|menor pre[cç]o|mais em conta|econ[oô]mico|entrada)/)) return "produto_barato";
  if (has(text, /(geek|anime|colecion|chibi|miniatura|fandom|nerd)/)) return "geek";
  if (has(text, /(organizador|organiza[cç][aã]o|porta c[aá]psula|porta capsula|gaveta|holder)/)) return "organizador";
  if (has(text, /(setup|mesa|suporte|controle|fone|cabo|dock|home office)/)) return "setup";
  if (has(text, /(decora[cç][aã]o|decoracao|decor|casa|vaso|lumin[aá]ria|parede)/)) return "decoracao";
  if (has(text, /(utilidade|funcional|cozinha|banheiro|gancho|suporte)/)) return "utilidade";
  if (has(text, /(quanto custa|pre[cç]o|valor|faixa|categoria|produto|cat[aá]logo)/)) return "produto_preco";

  return "fallback";
}
