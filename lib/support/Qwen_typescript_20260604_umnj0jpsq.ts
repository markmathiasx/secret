export type Intent =
  | 'chaveiro'
  | 'presente'
  | 'geek'
  | 'pokemon'
  | 'anime'
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
  | 'decoracao'
  | 'cozinha'
  | 'gamer'
  | 'unknown';

export function classifyIntent(message: string): Intent {
  const m = message.toLowerCase().trim();

  // Saudações
  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|e ai|eai|hello|hi)\b/.test(m)) return 'saudacao';
  
  // Agradecimentos
  if (/\b(obrigad|valeu|thanks|agradeç|vlw)\b/.test(m)) return 'agradecimento';
  
  // Categorias específicas
  if (/\b(chaveir|keychain)\b/.test(m)) return 'chaveiro';
  if (/\b(pokemon|pokémon|pikachu|charizard|bulbasaur|squirtle)\b/.test(m)) return 'pokemon';
  if (/\b(anime|mangá|manga|naruto|one piece|dragon ball)\b/.test(m)) return 'anime';
  if (/\b(geek|nerd)\b/.test(m)) return 'geek';
  if (/\b(gamer|game|jogo|playstation|ps5|xbox|nintendo)\b/.test(m)) return 'gamer';
  
  // Intenções de compra
  if (/\b(presente|lembrança|lembrancinha|aniversário|aniversario|dia das mães|dia dos pais|namorados)\b/.test(m)) return 'presente';
  if (/\b(barato|econômico|economico|menor preço|mais barato|promoção|promocao)\b/.test(m)) return 'barato';
  if (/\b(caro|premium|luxo|exclusivo|top)\b/.test(m)) return 'caro';
  if (/\b(lote|brinde|evento|corporativ|quantidade|atacado|revenda)\b/.test(m)) return 'lote';
  
  // Produtos específicos
  if (/\b(setup|mesa|escrivaninha|desk)\b/.test(m)) return 'setup';
  if (/\b(organiz|organizar|arrumar|porta|suporte)\b/.test(m)) return 'organizador';
  if (/\b(decora|decoração|decor|luminária|luminaria)\b/.test(m)) return 'decoracao';
  if (/\b(cozinha|café|cafe|capsula|cápsula|xícara|xicara)\b/.test(m)) return 'cozinha';
  
  // Personalização
  if (/\b(personaliz|nome|foto|imagem|custom|personalizado)\b/.test(m)) return 'personalizado';
  
  // Informações
  if (/\b(orçamento|orcamento|cotação|cotacao|quanto fica|quanto custa|preço|valor|custo)\b/.test(m)) return 'orcamento';
  if (/\b(prazo|demora|tempo|quando fica|dias|urgente)\b/.test(m)) return 'prazo';
  if (/\b(pagament|pix|cartão|cartao|parcela|boleto|crediário)\b/.test(m)) return 'pagamento';
  if (/\b(envio|entrega|frete|cep|correio|transportadora)\b/.test(m)) return 'envio';
  if (/\b(troca|devoluç|reembolso|arrepend|defeito|problema)\b/.test(m)) return 'troca';
  if (/\b(rastreio|rastre|código|codigo|onde está|onde esta|status)\b/.test(m)) return 'rastreio';
  
  // Atendimento humano
  if (/\b(humano|atendente|pessoa|falar com|telefone|whatsapp|zap|contato)\b/.test(m)) return 'humano';

  return 'unknown';
}