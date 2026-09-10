# MDH 3D: experiência completa de compra e operação
Data: 2026-09-10
Base inspecionada: ed10f260165bc0ad9ef2457efe900dd28dbff0fc
Estado: especificação de execução. Não comprova implementação, produção, faturamento ou testes.

## Objetivo e identidade
Transformar a MDH em uma loja própria confiável e simples de operar por Mark e Dressa. Identidade futurista discreta: grafite, titânio, branco mineral e azul elétrico restrito às ações. Monograma MDH geométrico; nenhum símbolo religioso explícito na interface pública. A origem pessoal da marca é preservada sem precisar ser exposta comercialmente.
A referência aos marketplaces é a clareza de navegação, compra, andamento e resolução de problemas. Não há acesso ou alegação de reprodução de sistemas internos proprietários.
Vender bem um catálogo viável vem antes de ampliar volume ou contratar muitas ferramentas. Nenhuma promessa de enriquecimento ou de confiança absoluta.

## Evidência e continuidade
- PR #13 permanece aberta, com conflito informado pelo GitHub. Reconciliar contra a base atual antes de reutilizar qualquer mudança.
- O arquivo docs/releases/2026-09-10-premium-storefront.md declara 538 itens públicos, 39 de compra direta e 12 destaques. São declarações do relatório; revalidar no código e no deployment antes de divulgar contagens.
- O código atual inclui mediaProvenance e distingue compra direta de itens sujeitos a revisão. Preservar essas proteções.
- O layout atual monta vários canais e painéis flutuantes em components/deferred-layout-widgets.tsx. Substituir a concorrência entre widgets por uma entrada única de ajuda.
- Não reutilizar artes conceituais como fotos de produtos; não restaurar lotes pelo número de itens.
- Não declarar que fotos antigas foram recuperadas sem conferir arquivo, SKU e procedência.
- Executar marketplace:phase0 antes de alterações funcionais, conforme AGENTS.md e docs/CODEX_EXECUTION_PROTOCOL.md.

## Cobertura obrigatória
| Área | Resultado esperado |
| --- | --- |
| Cabeçalho, rodapé e navegação móvel | Busca única, categorias, pedidos, ajuda e carrinho; mesma linguagem em todo o site |
| Início | Proposta clara, produtos autênticos, categorias úteis, bastidores reais e acesso a personalizados |
| Catálogo e busca | Filtros independentes por tipo, universo, personagem, material, faixa de preço e disponibilidade |
| Coleções | Chibis, Games, Chaveiros, Casa e Organização; links persistem filtros e resultados |
| Produto | Galeria autêntica, dimensões, material, cor, acabamento, conteúdo do pacote, preço, prazo e frete |
| Personalização | Briefing, referência, orçamento versionado e aprovação explícita antes da produção |
| Carrinho | Itens, variantes, quantidades, prazo estimado, frete e total sem surpresa |
| Checkout e pagamento | Dados mínimos, resumo final, Pix/cartão reais e recuperação de falhas |
| Conta e pedidos | Histórico, comprovantes permitidos, andamento, rastreio, ajuda e solicitações |
| Atendimento e pós-venda | Conversa vinculada ao pedido e histórico de resolução |
| Painel de operação | Fila de pedidos, pendências, produção, expedição e exceções |
| Configurações | Loja, catálogo, capacidade, frete, pagamentos, mensagens, usuários e métricas |
| Políticas e páginas institucionais | Informações consistentes, contatos reais e textos revisados para a operação |
| Blog, landing pages, campanhas, jogos e páginas legadas | Mesmo sistema visual; preservar URLs ou mapear redirecionamentos |
| Estados especiais | Vazio, erro, sem conexão, pedido cancelado, pagamento pendente, 404 e carregamento |

## Sistema visual
- Base pública: grafite #10141B, superfícies #19212C, texto #F6F8FC e secundário #B6C2D2. Usar superfícies claras nas fotos e nos formulários quando melhorarem leitura.
- Ação principal: azul #72B5FF com texto escuro; sucesso, alerta e erro usam cor acompanhada de texto/ícone.
- Tipografia legível, títulos editoriais contidos, corpo mínimo 16 px nos formulários.
- Escala de espaço 4/8/12/16/24/32/48/64; raios 12 e 20; linha de 1 px para hierarquia.
- Uma ação principal por etapa. Nada de vários botões disputando a compra.
- Alvos de toque de pelo menos 44 px; navegação por teclado; foco visível; contraste medido; preferência de movimento reduzido respeitada.
- Movimento curto e funcional. Arte abstrata leve da marca pode existir no hero; não simular peças, fábricas, clientes ou avaliações.
- Não carregar vídeo, visualizador 3D e chat pesado na primeira renderização. O visualizador exige arquivo verdadeiro correspondente ao SKU.
- Não esconder preço, frete, prazo ou informações essenciais atrás de efeito visual.
- Remover jargão interno do cliente: "gate", "fallback", "auditado", "pipeline" e critérios de curadoria pertencem ao painel técnico.
- Confiança resulta de entrega comprovada: não usar escassez, clientes online, descontos, avaliações, selos ou estatísticas fictícios.

## Taxonomia e comportamento dos filtros
Campos independentes: productType, style, universe, character, useCase, material, availability.
Exemplos conceituais: productType=keychain; style=chibi; universe=valorant; character=jett.
Os exemplos definem taxonomia; não afirmam existência de tais produtos no acervo.

- Chaveiros usa tipo explícito; "porta-chaves", "porta-chaveiro" ou uma palavra na descrição não bastam.
- Chibis usa estilo validado. Personagem ou jogo não implica automaticamente chibi.
- Games mostra universos associados ao produto; Valorant e League of Legends refinam esse conjunto.
- Personagens dependem do universo e do acervo; não sugerir personagens sem associação verificada.
- Casa usa finalidade validada; não incluir um boneco apenas porque sua descrição menciona mesa.
- Dentro de uma faceta multisseleção: OR. Entre facetas: AND.
- Parâmetro ausente não vira zero. Valores inválidos recebem tratamento explícito.
- A URL é fonte reproduzível do estado; voltar, atualizar, compartilhar e abrir diretamente preservam filtros.
- Contagens vêm dos dados elegíveis após cruzamento de filtros. Não fixar números na interface.
- Resultado vazio explica qual combinação está ativa e oferece remover um filtro. Não substitui silenciosamente por todo o catálogo.
- Carregamento parcial não pode sobrescrever filtros válidos da URL. Falha no carregamento mantém itens já obtidos e oferece tentar novamente.
- Produtos sem procedência suficiente permanecem no administrativo, com pendência identificada.

## Pedido e produção: estados separados
Separar pagamento, produção e entrega para não apresentar "pago" como "enviado".
Pagamento: pending, approved, failed, refunded, partially_refunded.
Produção: awaiting_brief, awaiting_approval, queued, printing, finishing, quality_check, ready.
Entrega: awaiting_dispatch, dispatched, delivered, exception, returned.
Cancelamento e reembolso são eventos explícitos; não apagar o histórico.

Fluxo normal: pedido criado -> pagamento confirmado pelo servidor -> briefing/aprovação quando necessário -> fila -> impressão -> acabamento/conferência -> postagem -> entrega.
O cliente vê somente etapas confirmadas, datas reais e previsões identificadas como estimativas.
O painel mantém horário, operador e origem de cada alteração. Não avançar a linha do tempo por temporizador.
Webhooks precisam de verificação, deduplicação, idempotência e reprocessamento seguro.
O total do pedido é calculado no servidor e congelado no momento da compra. Guardar snapshot da descrição, variante, preço, frete e prazo aceitos.
Não marcar pagamento como aprovado porque o navegador voltou à página de sucesso.

## Operação para duas pessoas
Uma tela "O que precisa da nossa atenção" concentra:
1. Pagamento aguardando confirmação.
2. Briefing ou aprovação pendente.
3. Pedidos pagos prontos para entrar na fila.
4. Impressões em andamento e falhas/reimpressões.
5. Conferência, embalagem e postagem.
6. Atrasos, solicitações de troca e mensagens sem resposta.

Cada cartão mostra pedido, produto/variante, quantidade, prazo prometido, responsável e próxima ação.
Capacidade diária considera horas de máquina disponíveis, material, acabamento e compromissos existentes. Não prometer entrega automática ignorando a fila.
Ações em lote com prévia, seleção explícita e registro. Permissões separadas para operar pedidos, administrar loja e acessar finanças.

## Configurações e dados
Reutilizar os modelos e provedores existentes antes de introduzir novos serviços. Reconciliar o schema atual antes de qualquer migration.
Entidades a reconciliar: Product, ProductMediaProvenance, ProductFacet, ProductVariant, Order, OrderItemSnapshot, Payment, PaymentEvent, ProductionJob, Shipment, OrderEvent, SupportCase, Review, Promotion, Consent.
- Fotos vinculadas a SKU, arquivo, fonte, responsável pela validação e direito de uso.
- Reviews vinculados a compra entregue; mídia real, moderação e trilha. Sem avaliações fictícias.
- Promoções com regras verificadas no servidor; início/fim, limite de uso, combinação e margem mínima.
- Pedido e atendimento privados exigem autorização; número do pedido isolado não dá acesso.
- Segredos somente no ambiente, nunca no cliente ou em documentação.
- Credenciais existentes e produção devem ser confirmadas antes de integração remota.
- Backups com restauração testada; não mudar schema remoto destrutivamente.

## Atendimento e IA
Uma entrada de ajuda acessível em todas as etapas, sem cobrir preço ou botão de compra.
Atendente automático se identifica como tal; responde a partir de produto, políticas e pedido autorizado.
Não inventa estoque, prazo, rastreio, desconto, confirmação de pagamento ou capacidade.
Quando não houver informação, encaminha para Mark/Dressa com o contexto e o pedido.
Personalização precisa de aprovação humana quando alterar medidas, função ou prazo.
Notificações transacionais para eventos reais. Marketing somente conforme preferências registradas, com saída simples.
Definir horário de atendimento e prazo de resposta conforme capacidade real, sem prometer 24/7 humano.

## Marketing com dinheiro limitado
1. Selecionar poucos produtos que vocês conseguem fabricar e entregar com qualidade e margem.
2. Completar cada página com fotos reais, vídeo curto do processo, tamanho e prazo.
3. Produzir conteúdo próprio: peça saindo da impressora, acabamento, uso e embalagem.
4. Vincular cada conteúdo à coleção ou produto certo com origem da visita identificável.
5. Medir visualização de produto -> carrinho -> checkout -> pedido pago -> entrega.
6. Só liberar mídia paga após compra e atribuição testadas. Começar com teto total controlado e hipótese por campanha.
7. Avaliar lucro, não apenas cliques. Pausar o que vende com prejuízo.

Margem de contribuição antes de marketing = receita - material - energia - desgaste - trabalho - embalagem - taxas - tributos aplicáveis - frete subsidiado - reserva de falhas/devoluções.
CAC de equilíbrio não pode superar essa margem. Valores devem vir da operação; não presumir recompra.
ROAS sozinho não mede lucro. Recompra, avaliações reais e entrega no prazo são prioridades de retenção.
SEO, feeds de produto e dados estruturados só descrevem oferta real. Não há garantia de posição no Google, ChatGPT ou marketplaces.
Nenhum investimento em anúncio, assinatura ou ferramenta foi autorizado por esta especificação.

## Sequência de execução e aceitação
A. Reconciliar main, PR #13, deployment e phase0. Inventariar rotas e listar a situação das mídias. Aceite: SHA, rotas e fontes identificados.
B. Corrigir o catálogo/filtros e preservar procedência. Aceite: links diretos, voltar, busca, paginação, vazio e catálogo parcial testados.
C. Implementar sistema visual comum e migrar todas as superfícies da tabela. Aceite: screenshots em desktop e mobile, navegação por teclado, sem sobreposições.
D. Validar carrinho, frete, pedido e pagamentos. Aceite: provedor em ambiente de teste, webhooks repetidos, falha e reembolso, sem duplicação.
E. Unificar acompanhamento, produção e atendimento. Aceite: pedido autorizado percorre eventos reais; outro cliente não consegue acessá-lo.
F. Instrumentar métricas, conteúdo e retenção. Aceite: eventos sem duplicidade/PII e origens rastreáveis.
G. Publicar de modo reversível, conforme regras do repo, e conferir o SHA em /api/release no deployment e no domínio.

Gates do repositório permanecem obrigatórios. Não declarar LCP, capacidade de 10 mil simultâneos ou fluxo de pagamento aprovado sem medição correspondente.
Metas de usabilidade e performance precisam ser medidas no dispositivo móvel; não confundir imagem de proposta com frontend executável.
A redefinição abrange todo o site, mas cada bloco precisa de validação antes de substituir produção.

## Situação desta entrega
Produzido: direção visual e contrato de execução para a loja inteira.
Não produzido nesta revisão: mudança funcional, migration, checkout validado, nova publicação ou campanha paga.
A inspeção ocorreu pelo GitHub; o clone pelo terminal não ficou utilizável durante esta revisão. Nenhum gate local foi declarado aprovado.
