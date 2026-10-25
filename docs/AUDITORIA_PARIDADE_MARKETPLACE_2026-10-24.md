# Auditoria crítica de paridade marketplace — MDH3D

**Data da evidência:** 24/10/2026
**Escopo:** Web, Android, iOS, API, dados, pagamentos, logística, operação, segurança, marketing, observabilidade e publicação.
**Meta avaliada:** capacidade funcional e operacional comparável a marketplaces industriais como Mercado Livre, Shopee e AliExpress — não mera semelhança visual.

## 1. Veredito executivo

O projeto já contém uma loja web extensa, catálogo público real, superfície administrativa, checkout, integrações de pagamento, recursos de marketing e um aplicativo Flutter Android inicial. Ele **ainda não constitui um marketplace operacional** e tampouco oferece paridade móvel/web: produção está com banco inválido, o aplicativo móvel não compra, o iOS não existe, o Seller Center é embrionário e pós-venda, estornos, disputas, logística reversa, mensageria e reputação não formam fluxos transacionais completos.

**Paridade operacional estimada: 25/100.** O número mede funcionamento comprovado, não quantidade de arquivos nem aparência.

### Estado verificável

| Superfície | Estado | Evidência principal |
|---|---|---|
| Web pública | Parcialmente operacional | Home e catálogo respondem; 538 produtos públicos; pagamentos reportados como configurados |
| Banco de produção | Indisponível | `DATABASE_URL` inválida; readiness degradada |
| Catálogo | Operacional em fallback estático | 848 registros estáticos; 538 publicáveis; banco não conectável |
| Pagamentos web | Credenciais presentes, fluxo integral não comprovado | `/api/payments/status` reporta Pix/cartão prontos; banco e auditoria de segurança bloqueiam aprovação |
| Android | Protótipo funcional de navegação | APK debug 196 MB, versão `0.1.0+1`, sem checkout/pagamento móvel |
| iOS | Ausente | Não há projeto `ios/`, artefato IPA, assinatura ou pipeline App Store |
| API móvel | Catálogo/conta/carrinho parciais | Checkout e pagamentos retornam HTTP 503 por projeto |
| Seller Center | Esqueleto | Tela declara blocos futuros para edição, mídia, produção e campanhas |
| Segurança de dependências | Reprovada | 11 vulnerabilidades web de produção; 3 na API móvel |
| Release público | Divergente do repositório auditado | Produção `57dbff...`; `origin/main` web `afb9ed...`; worktree auditada `4b8bfd...` |

## 2. Fontes e método

Esta auditoria separa quatro tipos de evidência:

1. **Fonte:** leitura do código e dos esquemas nos dois repositórios.
2. **Artefato:** inspeção estática do APK com REA.
3. **Execução local:** builds, testes, lint, typecheck e auditorias executados em 24/10/2026.
4. **Produção:** respostas HTTP dos endpoints públicos, sem assumir que código local foi publicado.

O arquivo `C:\Users\markkk\Downloads\rea-main.zip` foi tratado como pacote de ferramentas, não como aplicativo. Seu inventário contém o fonte do REA `6.5.0`; o aplicativo efetivamente analisado foi o APK encontrado no projeto Flutter.

### Artefatos REA

| Artefato | SHA-256 | Resultado |
|---|---|---|
| `rea-main.zip` | `fbe5606e42c844fbbfd40414113335bc5cac30a08654ed9270002586dd8f4ec1` | ZIP íntegro; 4.028 arquivos; fonte `rea-agents` 6.5.0 |
| `app-debug.apk` | `80ecf35694676cca392f69b54eb615adb362f27856cc30e6c7500e4bd19df557` | Android debug/JIT; pacote `br.com.mdh3d.mdh_mobile`; assinatura não verificada |

### Limites honestos

- A inspeção REA é estática e não comprova comportamento em dispositivo.
- O provedor de cenário visual automatizado do REA falhou e não foi mascarado por outro resultado.
- O Flutter SDK anteriormente usado não está mais no caminho registrado; análise/teste/build Flutter não foram reexecutados nesta rodada.
- Não houve compra real, Pix real, estorno real, etiqueta real, entrega real ou publicação em loja de aplicativos.
- As imagens passaram por existência/estrutura; correspondência semântica perfeita entre cada produto e mídia ainda exige conferência humana ou visão computacional com amostragem auditável.

## 3. Arquitetura encontrada

### Web

- Next.js 15, React 19, Prisma/PostgreSQL, Mercado Pago, Supabase, Sentry, Redis/Upstash opcional, Framer Motion, Three.js e web push.
- Loja, catálogo, PDP, carrinho, checkout, conta, pedidos, favoritos, reviews, perguntas, suporte, blog, feeds, SEO e administração.
- 58 modelos Prisma, incluindo usuários, vendedores, produtos, variantes, estoque, pedidos, pagamentos, remessas, cupons, reviews, chat, recomendações, fidelidade, indicação, campanhas, NPS e experimentos.
- A amplitude do código é alta, mas várias funções são superficiais, dependentes de banco indisponível ou apenas representadas por modelo/tela.

### Android

- Flutter com Firebase Auth, HTTP, armazenamento local e visualizador 3D.
- Catálogo, categorias, busca, paginação, favoritos, carrinho local, detalhes, conta, endereços e leitura de pedidos.
- Apenas três arquivos Dart principais; `main.dart` concentra aproximadamente 1.630 linhas e mistura bootstrap, estado, rede e UI.
- Não há checkout, pagamentos, cálculo de frete final, avaliações, cupons, notificações, recuperação de carrinho, devoluções, suporte transacional, deep links ou telemetria de produto.

### API móvel

- Express/PostgreSQL com saúde, capacidades, categorias, produtos, usuário, carrinho, endereços, pedidos e edição básica de produto do vendedor.
- `POST /api/orders` retorna `503 checkout_not_configured`.
- Rotas de pagamento retornam `503 payments_not_configured`.
- Existe módulo Mercado Pago não conectado ao fluxo exposto.
- O OpenAPI anuncia Pix que a implementação não entrega: contrato e runtime divergem.

### iOS

- Não há implementação. A ausência não é um backlog pequeno: exige projeto, identidade Apple, assinatura, APNs, universal links, política de privacidade, testes em dispositivos e pipeline de distribuição.

## 4. Problema estrutural central

Há **dois backends de comércio divergentes**:

1. APIs Next.js/Prisma da loja web.
2. API Express/PostgreSQL usada pelo Flutter.

Isso duplica produtos, carrinho, pedidos, autenticação e regras. A consequência é exatamente a observada: a web aparenta ter checkout enquanto o app recebe 503; o catálogo e o status de pedidos podem divergir; correções precisam ser replicadas; estoque e preço deixam de ter uma única verdade.

### Decisão arquitetural obrigatória

Adotar um único **Commerce Core** transacional como fonte de verdade. Web, Android, iOS, administração e integrações consomem o mesmo domínio e os mesmos eventos. O backend duplicado deve ser absorvido por um gateway/BFF móvel ou removido depois da migração.

```text
Web / Android / iOS / Admin
            |
      API Gateway/BFF
            |
 Commerce Core transacional
   | PostgreSQL + outbox
   | Redis/filas/jobs
   | pagamentos antifraude
   | frete/rastreamento
   | mídia/objetos/CDN
   | identidade/RBAC
            |
 Eventos -> notificações, CRM, busca, analytics, recomendações
```

## 5. Matriz de paridade funcional

Escala: `0` ausente; `1` esqueleto; `2` parcial; `3` utilizável; `4` robusto; `5` nível industrial comprovado.

| Domínio | Nota | O que existe | Falta para paridade industrial | Prioridade |
|---|---:|---|---|---|
| Marca e home | 3,5 | Identidade, categorias, confiança, responsividade | pesquisa com usuários, acessibilidade AA comprovada, personalização real | P1 |
| Catálogo/PIM/mídia | 3,0 | 538 itens públicos, variantes e mídia | governança PIM, licenças, deduplicação, autenticidade semântica integral | P0 |
| Busca e descoberta | 2,5 | busca/filtros/categorias | índice dedicado, sinônimos, tolerância a erro, ranking comportamental | P1 |
| PDP/configuração/3D | 2,5 | páginas, variantes, visualização 3D parcial | configurador unificado, SLA/preço em tempo real, AR e fallback acessível | P1 |
| Preço/custo/promoções | 2,0 | preço, cupons e campanhas no modelo | motor de margem, custo fabril, impostos, regras cumulativas e auditoria | P0 |
| Identidade e conta | 1,5 | credenciais web; Firebase no app | Google web real, vínculo de identidades, MFA, sessões/revogação e LGPD | P0 |
| Carrinho sincronizado | 2,0 | carrinho web e local móvel | carrinho servidor único, merge anônimo/logado, reserva e idempotência | P0 |
| Checkout | 1,0 | fluxo web; móvel desativado | contrato único, endereço/frete/pagamento, retentativa e acessibilidade | P0 |
| Pagamentos/estorno/fraude | 1,0 | Mercado Pago web e módulo móvel isolado | ledger, idempotência, conciliação, estorno, chargeback, antifraude, split | P0 |
| Pedidos/OMS | 1,0 | modelos e leitura de pedidos | máquina de estados, eventos, compensação, timeline única e SLA | P0 |
| Estoque e produção | 1,5 | estoque e disponibilidade | MRP/MES, capacidade por impressora, material, fila, perdas e QC | P0 |
| Frete/fulfillment | 1,0 | cotação Melhor Envio + fallback | compra de etiqueta, webhook, tracking, seguro, SLA e coleta | P0 |
| Devoluções/reclamações | 0,5 | endpoint envia e-mail | RMA persistente, mediação, evidência, logística reversa e reembolso | P0 |
| Reviews/Q&A/reputação | 1,0 | modelos e APIs | compra verificada, mídia moderada, reputação e antifraude | P1 |
| Favoritos/fidelidade/indicação | 1,0 | modelos e fluxo básico | ledger imutável, expiração, abuso, níveis e resgate transacional | P1 |
| Notificações/CRM | 0,5 | e-mail parcial e push modelado | preferências persistentes; SMS real; push; jornadas e entregabilidade | P0 |
| Suporte/chat | 0,5 | telas, WhatsApp e modelos | inbox omnicanal, SLA, anexos, contexto do pedido e escalação humana | P0 |
| Seller Center | 0,5 | página e modelos | onboarding, KYC, catálogo, estoque, pedidos, anúncios, desempenho e suporte | P0 |
| Comissão/ledger/repasse/fiscal | 0,0 | não comprovado | razão dupla, taxas, split, saldo, repasse, NF, retenções e reconciliação | P0 |
| Marketing/feeds/ads | 1,5 | SEO, blog, feeds e pixels | atribuição server-side, catálogo completo, ROAS, consentimento e CRM | P1 |
| Recomendação/personalização | 1,0 | heurística determinística | eventos confiáveis, ranking, exploração, cold start e avaliação offline | P2 |
| Analytics/experimentos | 1,0 | modelos e A/B parcial | taxonomia, warehouse, métricas norte, guardrails e decisão estatística | P1 |
| Segurança/LGPD | 0,5 | alguns controles e scans | dependências corrigidas, secrets, DPIA, consentimento, retenção e DSAR | P0 |
| Confiabilidade/escala/DR | 0,5 | health/readiness e build | SLO, filas, cache, testes de carga, backup restore, runbooks e multi-AZ | P0 |
| Android | 1,5 | catálogo/conta/carrinho local | compra completa, arquitetura modular, release assinado e Play Console | P0 |
| iOS | 0,0 | nada | implementação e ciclo App Store completo | P0 |
| Release/lojas/operação | 0,5 | Vercel público e APK debug | SHA alinhado, promoção imutável, Android/iOS CI/CD, rollback e evidência | P0 |

## 6. Ciclo integral — da demanda ao pós-consumo

### 6.1 Descoberta de demanda

**Necessário:** pesquisa de termos, concorrentes, tendências, margem, sazonalidade, intenção e direitos de uso. Cada SKU deve nascer com dono, hipótese comercial, custo-alvo, público, licença e critérios de descontinuação.

**Pendente:** PIM orientado a oportunidade, workflow de aprovação e trilha de propriedade intelectual. Importar imagens/modelos sem licença comprovada expõe catálogo e anúncios a remoção.

### 6.2 Engenharia do produto 3D

**Necessário:** arquivo mestre versionado, licença, impressora compatível, material, cor, perfil de slicer, tempo, massa, suportes, acabamento, tolerâncias, risco, segurança e amostra aprovada.

**Pendente:** BOM/roteiro de fabricação por variante, versão do STL/3MF, custo real por máquina e critérios de qualidade. Produto não deve ser publicável sem ficha de produção reproduzível.

### 6.3 Suprimentos

**Necessário:** fornecedores de filamento/resina, lote, cor, lead time, preço, qualidade, estoque mínimo, substitutos e rastreabilidade.

**Pendente:** compras, recebimento, lote, consumo e perdas. O estoque atual representa produto, não todo o material e capacidade necessários para fabricá-lo.

### 6.4 PIM, mídia e publicação

**Necessário:** título, taxonomia, atributos, dimensões, cuidados, licença, SEO, imagens autênticas, vídeo, modelo 3D, alt text, preço, prazo e política.

**Pendente:** prova automática + revisão humana de correspondência produto/mídia; normalização dos 848 registros; justificativa para 310 itens fora do catálogo público; governança do feed — apenas 39 produtos foram gerados em evidência de Meta feed enquanto 499 foram ignorados.

### 6.5 Custos, preço e margem

**Necessário:** filamento/resina, energia, depreciação, falha, mão de obra, embalagem, frete subsidiado, taxa do gateway, imposto, comissão, CAC, devolução e margem mínima.

**Pendente:** calculadora industrial e bloqueio de preço abaixo da margem. Cupons e frete grátis precisam consumir orçamento explícito, não apenas reduzir o total.

### 6.6 Capacidade e promessa

**Necessário:** disponibilidade por máquina/material, calendário, fila, manutenção, lote mínimo e previsão dinâmica de entrega.

**Pendente:** ATP/CTP — disponibilidade para prometer e capacidade para prometer. O site apresenta janelas, mas não há prova de cálculo conectado à fábrica.

### 6.7 Aquisição, confiança e consentimento

**Necessário:** SEO, conteúdo, feeds, anúncios, afiliados, prova social, políticas claras, consentimento LGPD e atribuição first-party.

**Pendente:** feeds completos, Consent Mode, eventos server-side deduplicados, política de claims publicitários, score de qualidade da mídia e atribuição por pedido/margem.

### 6.8 Identidade

**Necessário:** login por e-mail/social, verificação, recuperação, MFA opcional, vínculo seguro de contas, sessões, dispositivos, RBAC e exclusão/exportação de dados.

**Pendente:** produção expõe somente credenciais em `/api/auth/providers`; Google não está ativo na web. Firebase móvel e identidade web não foram unificados.

### 6.9 Carrinho e checkout

**Necessário:** carrinho servidor único, estoque/capacidade, endereço, frete, cupom, impostos, pagamento, revisão e confirmação idempotente.

**Pendente:** app móvel não finaliza compra; backend único inexistente; banco público indisponível; não há prova de concorrência, reserva, retentativa ou recuperação consistente.

### 6.10 Pagamento, fraude e conciliação

**Necessário:** payment intent, webhooks assinados, idempotência, ledger, reconciliação, antifraude, split, estorno parcial/total e chargeback.

**Pendente:** credencial não equivale a operação. Falta comprovar pedido-pagamento-webhook-ledger-estorno. API móvel responde 503; dependências críticas vulneráveis bloqueiam aprovação.

### 6.11 OMS e fabricação

**Necessário:** estados formais `aguardando_pagamento -> pago -> planejado -> imprimindo -> acabamento -> QC -> embalado -> enviado -> entregue`, com exceções, reprocesso e auditoria.

**Pendente:** máquina de estados única e eventos. Não basta alterar uma coluna de status; cada transição precisa de ator, hora, causa, efeito e compensação.

### 6.12 Qualidade e embalagem

**Necessário:** checklist por SKU, fotos de inspeção, tolerâncias, peso, acabamento, embalagem e liberação.

**Pendente:** QC transacional e vínculo de lote/unidade ao pedido. Sem isso, reclamações não retroalimentam o processo fabril.

### 6.13 Logística

**Necessário:** cotação, seleção, etiqueta, postagem/coleta, eventos da transportadora, exceção, seguro, prova de entrega e prazo real.

**Pendente:** cotação não fecha fulfillment. O fallback heurístico deve ser claramente homologação ou contingência; etiqueta, tracking e logística reversa precisam ser reais.

### 6.14 Entrega, suporte e reclamação

**Necessário:** timeline, notificações, inbox ligada ao pedido, SLA, bot identificado, humano, anexos, motivo, mediação e decisão auditável.

**Pendente:** Chatwoot indisponível e WhatsApp marcado como não disponível na saúde pública. O retorno atual por e-mail pode responder sucesso mesmo quando o envio falha.

### 6.15 Devolução, reembolso e disputa

**Necessário:** RMA, elegibilidade, evidências, etiqueta reversa, recebimento, inspeção, decisão, reembolso, estoque e contabilidade.

**Pendente:** domínio completo. Cancelamento atual é limitado a pedido aguardando pagamento; não cobre pedido pago, compensação e chargeback.

### 6.16 Reputação e retenção

**Necessário:** review de compra verificada, mídia moderada, resposta do vendedor, perguntas, reputação baseada em atraso/cancelamento/reclamação e CRM consentido.

**Pendente:** reputação operacional, moderação, detecção de abuso e preferência persistente de canais. SMS e preferências contêm stubs/logs.

### 6.17 Financeiro, fiscal e seller payout

**Necessário para marketplace:** KYC/KYB, contrato, comissão, razão contábil, saldo, reserva, split, repasse, nota fiscal, conciliação e relatório.

**Pendente:** praticamente todo o domínio. Sem ledger e repasse, o sistema é uma loja D2C com perfis de vendedor, não um marketplace.

### 6.18 Aprendizado operacional

**Necessário:** contribuição por pedido, CAC, conversão, atraso, defeito, devolução, NPS, LTV, coortes, motivo de perda e ciclo de melhoria.

**Pendente:** warehouse/eventos confiáveis e ligação entre marketing, pedido, fabricação, suporte e margem.

## 7. Android — backlog obrigatório

1. Dividir `main.dart` por domínio: app shell, autenticação, catálogo, carrinho, checkout, pedidos, suporte e configurações.
2. Adotar estado e navegação testáveis, DTOs versionados, repositórios, cache com expiração e tratamento offline.
3. Trocar carrinho local por carrinho do Commerce Core com merge anônimo/logado.
4. Implementar checkout, endereço, frete, cupom, Pix/cartão, 3DS quando aplicável e confirmação idempotente.
5. Implementar pedidos com timeline, tracking, cancelamento elegível, suporte, devolução e review verificado.
6. Integrar Firebase Auth ao mesmo usuário da web; vínculo Google/e-mail sem duplicar conta.
7. Adicionar FCM, deep links/App Links, analytics, consentimento, Crashlytics/Sentry e remote config com governança.
8. Criar flavors `dev/staging/prod`, configuração sem segredos, certificate pinning avaliado e armazenamento seguro.
9. Reduzir APK e produzir AAB release assinado; hoje o artefato é debug/JIT de 196 MB e não prova distribuição.
10. Testar unitário, widget, integração e dispositivo real; acessibilidade, rede lenta, offline, rotação e processos mortos.
11. Configurar Play Console: Data Safety, política de privacidade, conteúdo, closed testing, pre-launch report, assinatura e staged rollout.

## 8. iOS — implementação integral necessária

1. Gerar e manter o target iOS Flutter; definir bundle id, versões e ambientes.
2. Criar Apple Developer/App Store Connect, certificados, perfis e CI com signing protegido.
3. Integrar Firebase iOS, APNs, universal links, keychain, ATS e privacy manifest.
4. Implementar login Apple quando login social de terceiros for oferecido, conforme revisão vigente da App Store.
5. Entregar as mesmas funções Android via Commerce Core, sem bifurcar regras.
6. Validar compras de bens físicos: gateway externo do comércio, sem StoreKit para o produto físico.
7. Preparar Privacy Nutrition Labels, exclusão de conta, consentimento, suporte e URLs legais.
8. Testar iPhone SE até Pro Max, iPad se declarado, VoiceOver, Dynamic Type, rede adversa e background.
9. Distribuir TestFlight, corrigir crashes/energia e só então enviar para review com conta de demonstração.

## 9. Web — correções críticas

1. Corrigir `DATABASE_URL`/`DIRECT_URL` e provar migrações, conexão, backup e restore.
2. Atualizar dependências vulneráveis e repetir audit, typecheck, lint, testes e build.
3. Ativar Redis/Upstash e transformar jobs críticos em filas idempotentes com dead-letter.
4. Exigir segredo de cron; o job de carrinho abandonado não pode aceitar chamadas quando o segredo estiver vazio.
5. Persistir preferências de comunicação e substituir stubs de SMS/notificação.
6. Transformar retornos em domínio RMA e nunca responder sucesso se persistência/entrega essencial falhou.
7. Implementar Seller Center real ou remover promessas de marketplace até estar operacional.
8. Alinhar autenticação web/móvel, Google, autorização administrativa e trilha de auditoria.
9. Remover divergências de variáveis SMTP e validar envio/recebimento em staging.
10. Publicar somente artefato cujo SHA corresponda ao commit aprovado e ao `/api/release`.

## 10. Segurança, privacidade e abuso

### Bloqueadores atuais

- Web: 11 vulnerabilidades de produção, incluindo críticas em Next.js, Sentry e DOMPurify.
- API móvel: 3 vulnerabilidades, incluindo altas em `body-parser` e `zod`.
- Banco público inválido e segredos de produção não passam readiness.
- Ausência de assinatura release Android comprovada.
- Cron pode falhar aberto sem segredo.

### Controles mínimos

- SBOM, Dependabot/Renovate, SAST, secret scan, DAST controlado e política de patch.
- RBAC/ABAC, menor privilégio, MFA administrativo, rotação e cofre de segredos.
- Rate limit distribuído, WAF, proteção de login, device/risk signals e trilha de fraude.
- Criptografia, classificação de dados, retenção, exportação/exclusão, consentimento e registro de bases legais LGPD.
- Auditoria append-only para preço, pedido, pagamento, saldo, reembolso, produção e ação administrativa.
- Backups com restauração testada; RPO/RTO definidos; runbooks e simulações de incidente.

## 11. Escalabilidade real

“Suportar 10 mil requisições simultâneas” não pode ser inferido do framework. Exige perfil de carga e SLO.

### Arquitetura alvo

- CDN/edge para mídia e páginas cacheáveis.
- API stateless com autoscaling e pools de conexão controlados.
- PostgreSQL com índices medidos, réplica para leitura quando necessária e migrações compatíveis.
- Redis para sessão/cache/rate limit; fila para webhooks, e-mails, feeds, imagens e jobs.
- Outbox transacional para impedir pedido pago sem evento e evento sem pedido.
- Busca dedicada quando o volume/qualidade justificar.
- Object storage com transformações assíncronas e URLs assinadas.
- OpenTelemetry/Sentry com correlação `request -> order -> payment -> shipment`.

### Prova obrigatória

- Carga progressiva com catálogo, busca, carrinho e checkout separados.
- Teste de pico, soak, falha do gateway, webhook duplicado, banco lento e fila parada.
- Metas mínimas propostas: 99,9% para navegação; 99,95% para confirmação de pagamento; zero pedido duplicado; p95 definido por operação; erro por orçamento, não por média.

## 12. Ordem de execução

### Fase 0 — verdade operacional

- Corrigir banco, segredos, dependências críticas e SHA de release.
- Congelar novas features até web e API terem gates verdes.
- **Saída:** produção saudável, rollback e restore comprovados.

### Fase 1 — Commerce Core único

- Consolidar identidade, catálogo, preço, carrinho, pedido, pagamento, estoque e eventos.
- Migrar web sem mudar comportamento público; depois migrar app.
- **Saída:** um SKU, preço, estoque, usuário, carrinho e pedido têm uma única fonte.

### Fase 2 — compra e fabricação ponta a ponta

- Checkout móvel, ledger, webhooks, OMS, fila fabril, QC, frete e tracking.
- **Saída:** pedido homologado percorre pagamento até entrega sem edição manual de banco.

### Fase 3 — pós-venda e confiança

- RMA, estorno, disputa, suporte, reviews verificados, reputação e notificações.
- **Saída:** caso de defeito/atraso é resolvido e contabilizado integralmente.

### Fase 4 — Android e iOS de produção

- Modularização, paridade, acessibilidade, telemetria, assinatura e distribuição.
- **Saída:** AAB e IPA/TestFlight aprovados nos respectivos canais de teste.

### Fase 5 — marketplace

- KYC/KYB, seller center, comissão, ledger, split, repasse, fiscal, moderação e antifraude.
- **Saída:** terceiro vende, fabrica/entrega, recebe e é responsabilizado sob regras auditáveis.

### Fase 6 — crescimento

- Busca avançada, recomendação, CRM, feeds, atribuição, experimentos e otimização de margem.
- **Saída:** crescimento mensurado por contribuição e retenção, não apenas tráfego.

## 13. Critério de “pronto”

O sistema só alcança paridade industrial quando todos os itens abaixo possuem evidência:

- Mesmo catálogo, preço, carrinho, pedido e usuário em web/Android/iOS.
- Compra homologada Pix e cartão; duplicidade, falha e estorno testados.
- Pedido percorre produção, QC, etiqueta, tracking, entrega, suporte e devolução.
- Seller onboarding, KYC, comissão, repasse e fiscal funcionam se o modelo for marketplace.
- Android e iOS estão assinados, testados, publicados e monitorados.
- Zero vulnerabilidade crítica/alta aceita sem prazo e compensação formal.
- Banco, filas, cache, storage, observabilidade, backup e restore passam disaster drill.
- Testes de carga cumprem SLOs publicados.
- Release público apresenta o SHA aprovado e rollback foi ensaiado.
- Acessibilidade WCAG 2.2 AA e LGPD têm evidência, não apenas páginas de política.

## 14. Evidências executadas nesta auditoria

| Verificação | Resultado |
|---|---|
| Web `typecheck` | passou |
| Web `lint` | passou |
| Web build de produção | passou; 683 páginas/rotas geradas |
| Teste de imagens web | passou estruturalmente; 538 produtos públicos |
| Validação de assets | passou; 248 itens verificados |
| Validação estática Commerce OS | 46 checks passaram; não prova runtime |
| Verificação Industrial V6 | 10/10; com alertas de migração e arquivos sensíveis |
| Readiness de produção | falhou; 12 bloqueadores |
| Audit de dependências web | falhou; 11 vulnerabilidades de produção |
| Testes API móvel | 22/22 passaram, incluindo PostgreSQL |
| Check API móvel | passou |
| Audit API móvel | falhou; 3 vulnerabilidades |
| Flutter atual | não reexecutado; SDK não encontrado no caminho histórico |
| Produção `/api/release` | `57dbffea5785c5d053fb3b8c87b1239bd68a9e20` |
| Produção `/api/health` | degradada; banco e suporte indisponíveis |
| Produção `/api/catalog/health` | fallback estático; 538 publicáveis; banco não configurado |
| Produção `/api/auth/providers` | somente credenciais |

## 15. Referência industrial externa

Os requisitos de OMS, pagamento, remessa, reclamação, feedback e reputação foram confrontados com documentação pública oficial do Mercado Livre:

- https://developers.mercadolivre.com.br/pt_br/imovel-consulta-de-usuarios/gerenciamento-de-vendas
- https://developers.mercadolivre.com.br/pt_br/pedidos-e-opinioes
- https://developers.mercadolivre.com.br/pt_br/gerenciar-reclamacoes
- https://developers.mercadolivre.com.br/pt_br/experiencia-de-compra
- https://developers.mercadolivre.com.br/pt_br/produto-consulta-de-usuarios/reputacao-de-vendedores
- https://developers.mercadolivre.com.br/pt_br/produto-consulta-de-usuarios/gerenciamento-de-pagamentos

## 16. Conclusão

A MDH3D não precisa de mais telas antes de corrigir o núcleo. O próximo salto não é cosmético: é transformar catálogo, identidade, carrinho, pagamento, pedido, fabricação, logística e pós-venda em uma cadeia transacional única e demonstrável. O projeto possui material suficiente para isso, mas hoje entrega uma web rica apoiada por fallback estático, um app Android de navegação, uma API móvel sem compra e nenhum iOS.

O caminho de maior retorno é operar primeiro como **D2C vertical de impressão 3D com excelência**, mantendo a arquitetura preparada para marketplace. Ativar vendedores externos antes de ledger, KYC, repasse, disputa e reputação multiplicaria risco sem criar confiança. A paridade deve ser conquistada por fluxo completo e evidência operacional, não pelo volume de funcionalidades declaradas.

## 17. Atualização executada em 25/10/2026

- Checkout/Pix móvel implementado com idempotência, reserva de estoque, persistência anterior ao provedor, webhook autoritativo e falha fechada.
- Flutter recebeu compra completa e target iOS; análise estática ficou limpa e 22 testes passaram.
- API móvel ficou com 29 testes aprovados e zero vulnerabilidades npm.
- RMA web agora é persistente, auditável e administrável; confirmação não depende mais do sucesso do e-mail.
- Cron/notificações foram endurecidos; preferências persistem e entregas fictícias foram removidas.
- Dependências web ficaram com zero vulnerabilidades npm e todos os gates industriais passaram.
- Android release sem assinatura passou a ser bloqueado; workflows manuais foram adicionados para AAB assinado e compilação iOS em macOS.

Essas mudanças não transformam credenciais ausentes em operação real. Migration, pagamento, estorno, envio, assinatura, publicação e deploy permanecem condicionados às contas e infraestruturas externas correspondentes.
