# MDH 3D — Especificação Industrial V6

## Missão

Transformar a MDH 3D em uma loja própria de impressão 3D com experiência de compra, confiança, organização e operação comparáveis às grandes plataformas de comércio eletrônico, sem criar um marketplace multivendedor e sem mascarar limitações reais de uma operação com Bambu Lab A1 e A1 Mini.

O critério principal é vender mais com lucro, reduzir atrito, aumentar confiança, automatizar o que é repetitivo e preservar uma operação segura, mensurável e sustentável.

## Regras inegociáveis

1. Não inventar avaliações, vendas, estoque, prazos, fotos, certificações, depoimentos ou métricas.
2. Produto sem mídia real aprovada permanece oculto, em rascunho ou claramente identificado como orçamento sob medida; imagem conceitual nunca pode parecer foto real.
3. Não publicar personagens, marcas, franquias ou designs sem licença comercial comprovada.
4. Não baixar preço abaixo do custo completo nem abaixo da margem comercial configurada.
5. Chaveiros incluem impressão, tempo de máquina, acabamento, argola, corrente, montagem, embalagem individual, insumos de postagem, reserva de falhas e despesas indiretas. Frete real é separado.
6. Não expor segredos, tokens, hashes, senhas, arquivos `.env`, `.vercel`, `supabase/.temp` ou dados privados em logs, commits ou respostas públicas.
7. Mudanças de banco devem ser versionadas, aditivas, reversíveis e compatíveis com produção. Proibido apagar dados, tabelas ou colunas em produção.
8. Pagamentos e webhooks devem ser idempotentes, validar assinatura e resistir a repetição, reordenação e timeout.
9. Autorização deve ser verificada no servidor. UI escondida não conta como segurança.
10. Toda função pública precisa de estado de carregamento, vazio, erro e recuperação.
11. Não duplicar sistemas existentes. Consolidar fontes de verdade e remover apenas código comprovadamente morto, com testes.
12. O projeto só está pronto quando typecheck, lint, build, testes, validadores, auditoria de segurança e smoke tests passam.

## Resultado comercial esperado

### Vitrine

- Home enxuta, mobile-first, com proposta de valor clara, busca útil, categorias prioritárias, provas reais, produtos campeões, lotes empresariais, sob medida e CTA humano.
- Catálogo público curado: inicialmente 12 a 30 produtos aprovados, sem centenas de variações geradas.
- Ranking por disponibilidade, mídia aprovada, margem, conversão, prazo e relevância; não por volume artificial.
- Busca tolerante a erro, sinônimos, sugestões, histórico local, recentes e filtros consistentes.
- Página de produto com mídia real, variantes, medidas, material, prazo, itens incluídos, personalização, quantidade, preço por lote, entrega por CEP, política e produtos complementares.
- Carrinho persistente, checkout como visitante, login opcional, resumo completo e recuperação de abandono.
- Nunca usar urgência, escassez ou prova social falsa.

### Conta e autenticação

- Cadastro e login claros, recuperação de senha, verificação de e-mail quando configurada, sessões protegidas e rate limiting.
- Conta com pedidos, rastreamento, endereços, favoritos, arquivos de personalização, notificações, devoluções e privacidade.
- 2FA e login social somente quando totalmente configurados; caso contrário, feature flag e fallback seguro.
- Separação forte de papéis: cliente, suporte, produção, gerente, administrador.

### Catálogo e preço

- Fonte única de verdade para produto, variante, mídia, custo, margem, disponibilidade e prazo.
- Ciclo: rascunho → revisão → aprovado → ativo → pausado → arquivado.
- SKU estável; variantes por cor, tamanho, material e acabamento; regras de capacidade e compatibilidade por impressora.
- Item sob encomenda usa disponibilidade `made_to_order` e capacidade calculada; nunca usa número de estoque fictício para parecer disponível.
- Dados de envio: peso, dimensões, embalagem, proteção e prazo de produção.
- Licença/origem do modelo e evidência de autorização comercial.
- Preço por canal sem perder margem: loja, lote, orçamento e futuros marketplaces.

### Operação de impressão 3D

- Máquina de estados do pedido e da produção.
- Fila com A1/A1 Mini, material, cor, gramas, horas, prioridade, prazo, operador e dependências.
- Reserva e baixa de filamento, argolas, correntes, embalagens, etiquetas e demais insumos.
- Registro de falha, causa, reimpressão, desperdício e custo real.
- Controle de qualidade com checklist e evidência quando apropriado.
- Embalagem, etiqueta, postagem, rastreamento, entrega, troca e reembolso.
- Painel de capacidade: horas disponíveis, carga por impressora, atraso previsto e lucro por hora de máquina.

### IA aplicada com controle

- Assistente público responde somente com catálogo, políticas, pedidos do próprio usuário e fontes internas permitidas; nunca inventa produto, preço ou prazo.
- Busca semântica e recomendações com fallback determinístico.
- Copiloto administrativo pode sugerir conteúdo, preço, prioridade e resposta, mas alterações críticas exigem trilha de auditoria e regra de autorização.
- Classificação de intenção, recuperação de carrinho, indicação de kits, detecção de anomalia e resumo operacional.
- Prompt injection, exfiltração e instruções vindas de conteúdo externo devem ser tratados como dados não confiáveis.
- Custos de IA, latência, falhas, cache, limites e escalonamento para humano devem ser monitorados.

### Administração

- Dashboard com receita, pedidos, margem, ticket, conversão, capacidade, atrasos, falhas, estoque crítico e próximos passos.
- Produtos, variantes, mídia, custos, margem, SEO, licenças, disponibilidade e preços por canal.
- Pedidos, pagamentos, produção, atendimento, devoluções, clientes, cupons e conteúdo.
- RBAC, trilha de auditoria e confirmação reforçada para ações destrutivas.
- Exportações e relatórios sem expor dados sensíveis.

### SEO, aquisição e retenção

- Metadados únicos, canonical, sitemap, robots, Open Graph e JSON-LD Product/Offer/Breadcrumb/Organization válido.
- Dados estruturados no HTML inicial das páginas de produto.
- Feeds Google/Meta consistentes com o catálogo público e com estoque/preço reais.
- Landing pages por intenção e região sem conteúdo duplicado ou páginas vazias.
- Conteúdo útil sobre uso, materiais, personalização e produção; não gerar páginas em massa sem valor.
- Cupons, indicação, favoritos, reposição de estoque, pós-venda, avaliação verificada e recompra.
- Eventos de funil com consentimento: busca, produto, personalização, carrinho, checkout, pagamento e recompra.

### Qualidade industrial

- Core Web Vitals como alvo: LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 no percentil 75.
- Acessibilidade WCAG 2.2 AA onde aplicável: teclado, foco, rótulos, contraste, mensagens de erro e reduced motion.
- Sem erro de hidratação, console ou runtime nas rotas críticas.
- Build com orçamento preventivo máximo de 1.900 rotas; produtos ocultos, rascunhos e variações não comerciais não podem inflar `generateStaticParams`, sitemap ou feeds.
- API com validação, rate limit, timeout, idempotência e logs estruturados.
- RLS no Supabase para tabelas expostas e políticas mínimas por papel.
- Backups, migrações, health checks, observabilidade, alertas e rollback.

## Rotas críticas mínimas

- `/`
- `/catalogo`
- uma página real de produto
- `/chaveiros-personalizados`
- `/brindes-e-lotes`
- `/sob-medida`
- `/carrinho`
- `/checkout`
- `/login`
- `/cadastro`
- `/conta`
- `/pedidos`
- `/atendimento`
- `/admin/login`
- `/api/health`
- `/api/catalog/health`

## Portões de aprovação

1. Auditoria de dependências de produção: zero vulnerabilidades conhecidas.
2. Scan de segredos: aprovado.
3. Prisma e Supabase: esquema válido, RLS e lint sem erro.
4. Catálogo: somente itens aprovados, margem e mídia válidas.
5. Autenticação e rotas privadas: aprovadas.
6. Pagamento: assinatura e idempotência validadas.
7. TypeScript, lint e build: aprovados.
8. Testes de imagens, rotas, checkout e e2e críticos: aprovados.
9. Stage Vercel: sem erros de runtime e rotas críticas aprovadas.
10. Produção: promoção seguida de smoke test; rollback automático em falha.

## Definição de pronto

Não basta criar arquivos, telas ou planos. O trabalho termina quando a implementação existente foi reconciliada, os fluxos críticos funcionam, os testes comprovam o comportamento, o catálogo público é comercialmente defensável, o banco está protegido, o stage foi validado e a produção respondeu sem regressão.
