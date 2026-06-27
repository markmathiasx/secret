export type Intent =
  | 'chaveiro'
  | 'presente'
  | 'geek'
  | 'pokemon'
  | 'setup'
  | 'organizador'
  | 'personalizado'
  | 'orcamento'
  | 'preco'
  | 'prazo'
  | 'pagamento'
  | 'envio'
  | 'troca'
  | 'rastreio'
  | 'humano'
  | 'saudacao'
  | 'agradecimento'
  | 'barato'
  | 'caro'
  | 'lote'
  | 'brinde'
  | 'unknown';

export function classifyIntent(message: string): Intent {
  const m = message.toLowerCase();

  if (/\b(oi|olá|ola|bom dia|boa tarde|boa noite|e ai|eai)\b/.test(m)) return 'saudacao';
  if (/\b(obrigad|valeu|thanks|agradeç)\b/.test(m)) return 'agradecimento';
  if (/\b(chaveir|keychain)\b/.test(m)) return 'chaveiro';
  if (/\b(pokemon|pokémon|pikachu|charizard|anime|mangá|manga)\b/.test(m)) return 'pokemon';
  if (/\b(geek|nerd|gamer|jogo|game)\b/.test(m)) return 'geek';
  if (/\b(presente|lembrança|lembrancinha|aniversário|aniversario)\b/.test(m)) return 'presente';
  if (/\b(barato|econômico|economico|menor preço|mais barato)\b/.test(m)) return 'barato';
  if (/\b(caro|premium|luxo|exclusivo)\b/.test(m)) return 'caro';
  if (/\b(setup|gamer|mesa|escrivaninha|ps5|playstation|xbox)\b/.test(m)) return 'setup';
  if (/\b(organiz|organizar|arrumar|porta)\b/.test(m)) return 'organizador';
  if (/\b(personaliz|nome|foto|imagem|custom)\b/.test(m)) return 'personalizado';
  if (/\b(orçamento|orcamento|cotação|cotacao|quanto fica|quanto custa|preço|valor)\b/.test(m)) return 'orcamento';
  if (/\b(prazo|demora|tempo|quando fica|dias)\b/.test(m)) return 'prazo';
  if (/\b(pagament|pix|cartão|cartao|parcela|boleto)\b/.test(m)) return 'pagamento';
  if (/\b(envio|entrega|frete|cep|correio)\b/.test(m)) return 'envio';
  if (/\b(troca|devoluç|reembolso|arrepend)\b/.test(m)) return 'troca';
  if (/\b(rastreio|rastre|código|codigo|onde está)\b/.test(m)) return 'rastreio';
  if (/\b(lote|brinde|evento|corporativ|quantidade|atacado)\b/.test(m)) return 'lote';
  if (/\b(humano|atendente|pessoa|falar com|telefone|whatsapp)\b/.test(m)) return 'humano';

  return 'unknown';
}