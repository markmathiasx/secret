# Evidência de entrega

Data de início desta reconstrução: 2026-10-08 em America/Sao_Paulo (2026-10-09 UTC).

## Recuperação

Clone da branch `codex/native-marketplace-20261007` em `ae5552eb98fced90b1405730fab09ee4168b031a`, confirmado por `git ls-remote`. Esse commit continha somente o adaptador Pix e seus testes, além da base anterior do site e relatórios. Código de app/API não enviado em sessões interrompidas não é considerado entregue.

## Evidência inicial

- `npm run marketplace:phase0`: exit 0, 59 afirmações reconciliadas. Relatórios antigos não comprovam funcionamento atual.
- `node --test services/marketplace-api/test/mercado-pago.test.js`: exit 0, **6 testes** após correção de validade Pix e timestamp webhook. Testes usam provider HTTP simulado: **não houve homologação sandbox nem pagamento real**.
- Sem comprovação atual de deploy, APK, IPA ou integração ao banco do site.

## Pendências de produto

A matriz integral em SPECIFICATION.md tem implementação parcial e itens pendentes. Esta rodada não entrega equivalência 100% a Shopee/Mercado Livre, capacidade de 10k usuários comprovada, protótipo Figma, AR nativa, split homologado, chat, cashback, campanhas ou publicação nas lojas.

Nenhum teste de unidade substitui validação em dispositivo, banco persistente e gateway homologado.

## API e fonte mobile

- Verificação independente no checkout integrado: `npm test` na API, **18 passaram, 1 ignorado**, exit 0. HTTP local usa colaboradores injetados para banco/token/gateway. A suite PostgreSQL real foi adicionada, mas ignorada localmente por ausência de `TEST_DATABASE_URL` e PostgreSQL disponível.
- `npm run check` na API: exit 0; `npm audit --omit=dev`: zero achados.
- OpenAPI, SQL isolado, roles/ownership, categorias/produtos paginados, carrinho persistente, endereços, consulta de pedidos e cadastro/edição auditada pelo vendedor implementados. Criação de pedido/pagamento responde 503. Não houve migration remota.
- Flutter fonte: catálogo/texto/categoria/paginação, detalhe, viewer condicional, carrinho/favoritos locais por origem/UID e login Firebase opcional. Parser rejeita centavos/estoque fracionários ou fora dos limites. Não inclui checkout nem sincronização cloud de carrinho.
- Dart SDK obtido pelo bootstrap Flutter 3.35.4; `dart format` passou nas quatro fontes/testes. A resolução das dependências foi interrompida por **rejeição automática de segurança**, pois o processo tentou acessar metadados da infraestrutura, uma fronteira sensível que pode expor credenciais. Não houve contorno nem nova tentativa de rede Flutter após esse bloqueio.
- `flutter analyze`, `flutter test`, projetos nativos, AAB e IPA **não foram executados/gerados**. Formatter prova parsing, não compilação, resolução de pacotes ou funcionamento nativo.
- Workflow GitHub Actions proposto testa API em PostgreSQL descartável e fonte Flutter. **Não foi executado**; o conector GitHub não está disponível nesta rodada.

## Site e envio

- Baseline recuperado: `npm ci`, Prisma validate, typecheck, lint, test:images, validate:assets:fs e build passaram. Imagens: 538 produtos públicos; assets: 248 arquivos. O build pós-correções de dependências tem resultado separado no relatório final desta rodada.
- Importação real de PrismaClient: `function`; secret scan: zero achados atuais/introduzidos de alta confiança. Scanner não comprova ausência absoluta de segredos.
- Consulta a `https://www.mdh3d.com.br/api/release` retornou release **57dbffea5785c5d053fb3b8c87b1239bd68a9e20**, branch `main`. `git ls-remote` confirmou main **afb9ed818edfcb0f13e04f809578a68049efe83a** e branch da entrega **ae5552eb98fced90b1405730fab09ee4168b031a** no momento da consulta. O endpoint aceita override de variável de ambiente; esses dados não comprovam identidade entre site, repo e checkout local.
- `git push origin HEAD:codex/native-marketplace-20261007` falhou: autenticação indisponível (`could not read Username`). Não houve push dos novos commits nem deploy desta rodada. O commit Pix anterior permanece no remoto.

## Bloqueios separados

**Código ainda ausente:** ciclo financeiro/pedido, frete/split/cartão, chat/push, AR, reviews/reputação, ledger/cupons/cashback, dashboards completos, moderação, NF-e, migração do catálogo/identidades e fluxos LGPD. Ver matriz de escopo.

**Integração/configuração:** PostgreSQL e Firebase reais, gateway/logística, OAuth/assinatura mobile, contas das lojas, conector GitHub para push e ambiente seguro para validar Flutter.

**Gates pendentes:** testes de banco/gateway/dispositivos, cobertura 80%, e2e, carga, auditoria completa de desenvolvimento, CI, deploy e igualdade por SHA.

## Gate integrado após atualizar dependências

Sequência independente concluída com exit 0: `npm ci` → `security:validate-patched-dependencies` → `security:audit:production` → `prisma:validate` → `typecheck` → `lint:check` → `test:images` → `validate:assets:fs` → `build`. Next.js 15.5.27 compilou e gerou as páginas. A validação de tipos/lint foi executada explicitamente antes do build; o build do repositório pula esses dois checks internos.

Smoke HTTP do servidor standalone após build: `/`, `/catalogo`, três páginas de produto reais, `/carrinho`, `/checkout`, `/login`, `/rastrear` e `/api/release` retornaram 200; `/conta` retornou 307 para sessão anônima. Busca foi consultada com query, mas esse smoke somente comprova resposta HTTP, não a interação/filtro no cliente. Primeira tentativa entre sessões isoladas falhou com ECONNREFUSED; execução do servidor e consulta no mesmo processo de verificação passou. Configuração comercial/autenticação real continua ausente: o log de startup alertou `DATABASE_URL`, credenciais Mercado Pago e secret de sessão não configurados. HTTP 200 não prova login, pagamento ou prontidão de produção.

OpenAPI foi parseado como JSON válido. Docker e CI não executados. Não há evidência de cobertura 80% nem igualdade entre a versão local e o site publicado.

O gate estrito final `npm audit --audit-level=low --json` terminou com **exit 1 e 16 achados (13 altos, 3 moderados)** no grafo completo. Esse resultado mais recente prevalece sobre os 14 registrados na geração anterior do relatório. A auditoria `--omit=dev` da sequência integrada retornou zero; não declarar o gate de todas as dependências aprovado.

## Correções de dependências — 2026-10-09 UTC

Foram atualizados Next.js, bundle-analyzer e eslint-config-next para 15.5.27; Sharp para 0.35.5; Undici para 6.28.1; Nodemailer para 10.0.16. Overrides de brace-expansion 5.0.12, DOMPurify 3.4.16, source-map-js 1.2.2 e postcss-selector-parser 7.1.6 eliminam os achados da auditoria de dependências de produção. O validador mantém os mínimos exatos sincronizados com o lockfile.

Evidências executadas neste checkout:

- `npm install --ignore-scripts --no-fund`: exit 0; lockfile atualizado sem executar scripts de instalação.
- `npm run security:validate-patched-dependencies`: exit 0.
- `npm run security:audit:production`: exit 0, **0 vulnerabilidades** no conjunto `--omit=dev` consultado nessa execução. Isso não comprova segurança absoluta do produto.
- `npm run typecheck && npm run lint:check`: exit 0 após ajuste da importação do tipo `Transporter` em lib/mailer.ts, necessário pelos tipos próprios de Nodemailer 10.
- Smoke com `nodemailer.createTransport({streamTransport:true, buffer:true})`: envelope, assunto e corpo de e-mail aprovados; nenhum e-mail externo enviado. SMTP real permanece sem homologação.
- `npm run security:audit:all:report`: relatório gerado com **14 achados (12 altos, 2 moderados)** no conjunto completo de dependências, incluindo ferramentas de build/desenvolvimento. O limite desse comando é 9999: seu exit 0 indica geração do relatório, não auditoria limpa. O gate estrito de todas as dependências permanece pendente.

Exceção conhecida de compatibilidade: NextAuth 5.0.0-beta.32 declara peer opcional Nodemailer `^7.0.7 || ^8.0.5`; o projeto já utilizava Nodemailer 9 fora dessa faixa e `legacy-peer-deps=true`. Nodemailer 10.0.16 exige Node >=20, compatível com Node >=24 requerido pelo repositório. O projeto usa transporte SMTP diretamente, sem provider de e-mail do NextAuth em auth.ts. Typecheck e smoke local passaram, mas isso não remove o descompasso formal de peer nem valida entrega por SMTP. Não habilitar provider de e-mail NextAuth sem resolver essa compatibilidade.

Fonte primária revisada para a migração: https://github.com/nodemailer/nodemailer/blob/master/CHANGELOG.md (versões 10.0.0 e 10.0.16). `npm view nodemailer@10.0.16 engines types` e `npm view next-auth@5.0.0-beta.32 peerDependencies --json` confirmaram os requisitos e a exceção acima.
