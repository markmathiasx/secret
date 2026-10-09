# Seis sprints de duas semanas

Este cronograma organiza o escopo integral; não é garantia de concluir um marketplace equivalente aos gigantes em doze semanas. Equipe, orçamento, integrações contratadas e desempenho dos testes determinam capacidade. Cada sprint entrega fatias de ponta a ponta, não apenas telas ou documentação. Itens não aprovados permanecem no backlog e bloqueiam o release correspondente.

| Sprint | Implementação | Gate de saída |
| --- | --- | --- |
| 1 — Fundação | Flutter nativo, navegação/temas/a11y, API, PG isolado, CI, Firebase e-mail/Google/Apple, OTP/telefone/Facebook, perfil/endereço, RBAC/MFA, consentimento | Login/refresh/logout/recuperação reais Android+iOS, token revogado bloqueado, ownership entre duas contas, ambiente reproduzível |
| 2 — Descoberta | Taxonomia games/personagens/tipo de peça, mídia real, variantes, paginação/facets, texto/voz/imagem, 3D/AR, favoritos/cache, feed/recomendação, rascunho/moderação | Filtros retornam somente itens elegíveis; contagens consistentes; acessibilidade e limite de GPU; modelos licenciados; zero placeholders comerciais |
| 3 — Compra | Carrinho cloud/offline, preço/cupom/cashback no servidor, frete/retirada, reserva concorrente, Pix/cartão/boleto/split, webhook/ledger/outbox/refund | Duas compras não excedem estoque; retry não duplica pedido/pagamento; valor adulterado rejeitado; sandbox Pix/cartão/split/estorno; total explícito |
| 4 — Pós-compra | Produção/postagem/rastreio, chat/anexos/áudio, leitura/typing, push/badges/preferências, disputas/devoluções | Fluxo pago→produção→entrega, webhook repetido/fora de ordem, reconexão sem perda, anexo privado protegido, push real em dispositivo |
| 5 — Operação | Painéis vendedor/admin, upload em lote/STL thumbnails/cotação, NF-e, reviews reais/reputação, campanhas/flash deals/anúncios, withdrawals | Vendedor só edita seus itens; revisão compra verificada; moderação/campanha auditada; KYC/saque idempotente; nota fiscal externa homologada |
| 6 — Lançamento | E2E, cobertura, carga, recuperação, hardening, observabilidade, privacidade/exclusão, protótipo aprovado, assinatura/TestFlight/Play fechado | ≥80% cobertura medida, gates verdes, backup restaurado, SLO em carga documentada, revisão LGPD/lojas, versão assinada e rollout controlado |

## Caminho crítico

Identidade → ownership → catálogo/estoque → carrinho → pedido/reserva → gateway/conciliador → entrega → review/ledger/saque. Nenhum painel de vendas inventa números para aparentar funcionamento. Dados vazios apresentam estado vazio.

Chat/mídia, experiência mobile e infraestrutura podem avançar em paralelo com contratos estáveis; schema, migrations e checkout têm dono único. Integração e gates são serializados por SHA.

## Casos obrigatórios

- Autorização: comprador A não lê/edita conta, endereço, carrinho, pedido ou conversa de B; vendedor A não altera produto B; token válido de conta suspensa falha.
- Dinheiro: centavos exatos, arredondamento explícito, cupom expirado, frete inválido, valor adulterado, timeout gateway, assinatura inválida, eventos duplicados, aprovação tardia, refund parcial, chargeback.
- Concorrência: última unidade disputada, troca de preço durante checkout, operações de carrinho concorrentes, estoque reservado expirando, retries em múltiplas réplicas.
- Mobile: retomada em background, rede intermitente, troca de conta, cache antigo, fontes grandes, leitor de tela, dispositivos pequenos/tablets e AR indisponível.
- Recuperação: morte do worker entre gateway e commit, outbox acumulada, Redis indisponível, banco sem conexão, replay de fila, restore de backup e rollback de app/API compatíveis.

## Prova de conclusão

Cada requisito da SPECIFICATION.md recebe arquivo/endpoint, teste, SHA e evidência runtime. Falta de segredo não explica ausência de implementação. Defeitos, integrações não escritas e credenciais ausentes são registrados separadamente. Promover produção só após validação do mesmo artefato em staging.
