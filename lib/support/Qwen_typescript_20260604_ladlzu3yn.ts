export type Intent = 
  | 'chaveiro'
  | 'presente'
  | 'geek'
  | 'setup'
  | 'organizador'
  | 'personalizado'
  | 'orcamento'
  | 'preco'
  | 'prazo'
  | 'humano'
  | 'saudacao'
  | 'unknown';

export function classifyIntent(message: string): Intent {
  const lower = message.toLowerCase();
  
  if (lower.includes('chaveir')) return 'chaveiro';
  if (lower.includes('presente') || lower.includes('lembrança')) return 'presente';
  if (lower.includes('geek') || lower.includes('anime') || lower.includes('pokemon')) return 'geek';
  if (lower.includes('setup') || lower.includes('gamer') || lower.includes('mesa')) return 'setup';
  if (lower.includes('organizad') || lower.includes('organizar')) return 'organizador';
  if (lower.includes('personaliz') || lower.includes('nome') || lower.includes('foto')) return 'personalizado';
  if (lower.includes('orçament') || lower.includes('cotação') || lower.includes('quanto fica')) return 'orcamento';
  if (lower.includes('preço') || lower.includes('custa') || lower.includes('valor')) return 'preco';
  if (lower.includes('prazo') || lower.includes('demora') || lower.includes('tempo')) return 'prazo';
  if (lower.includes('humano') || lower.includes('atendente') || lower.includes('pessoa')) return 'humano';
  if (lower.includes('olá') || lower.includes('oi') || lower.includes('bom dia')) return 'saudacao';
  
  return 'unknown';
}