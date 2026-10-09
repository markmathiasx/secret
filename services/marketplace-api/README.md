# API mobile MDH — base executável, sem checkout ativo

Node 24/25, Express 5, PostgreSQL e Firebase Admin. Esta API é separada do site: não migra automaticamente contas, preços, catálogo ou pedidos existentes. Não publica imagens ilustrativas nem importa anúncios de concorrentes. Produtos só aparecem se `published=true`, o vendedor estiver habilitado e existirem dados reais cadastrados.

## Execução local

```sh
npm ci
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/ISOLATED_DATABASE'
export FIREBASE_PROJECT_ID='your-project'
export GOOGLE_APPLICATION_CREDENTIALS='/private/path/service-account.json'
export ALLOWED_ORIGIN='https://your-reviewed-web-admin.example'
npm run migrate
npm start
npm test
npm audit --omit=dev
```

Execute dentro deste diretório. Nunca coloque credenciais no Git. A migration cria apenas `mdh_marketplace`; não executa reset nem copia tabelas do site. Revise o SQL, confirme o projeto, execute primeiro em banco de teste e faça backup antes de qualquer migração remota. O comando `migrate` é inicial/idempotente; evolução de schema exige migrations numeradas e controle de versões antes de uso contínuo em produção.

Firebase Admin verifica revogação do token. Cadastro é gerenciado pelos SDKs Firebase no app; esta API materializa o perfil no primeiro acesso. E-mail não verificado recebe 403. Login por telefone pode não ter e-mail. Novos perfis são compradores. Papel de vendedor/admin só pode ser atribuído por operação confiável de administração do banco; não existe promoção pública. A configuração de Google/Apple/Facebook/SMS e apps autorizados é externa e ainda necessária.

## Contrato

`openapi.json` documenta o contrato. Listagem de produtos aceita `categoryId`, `q`, `cursor` UUID e `limit` (1–50); resposta `{items,nextCursor}`. Busca é substring literal parametrizada e ordem por UUID, não relevância/personalização. Listas de endereços, categorias, produtos do vendedor e pedidos usam `{items}`. Carrinho usa `{items,totalCents}`. Dinheiro inteiro em centavos. Preço é sempre obtido do servidor, não do payload do comprador.

O carrinho limita 100 linhas e 99 unidades por linha; adicionar não reserva estoque. Edição do vendedor exige propriedade do produto mesmo para papel admin; registra auditoria dentro da mesma transação. Criação pelo vendedor usa POST e proprietário atribuído pelo servidor, com auditoria transacional. Admin global, exclusão definitiva de produtos, uploads, logística, cupons, chat, reviews, pagamento, reserva, cancelamento e notificações ainda não estão implementados. Edição recebe objeto completo via PUT. Cadastro inicial pode ser realizado com POST por um vendedor autorizado; importação em lote e a interface administrativa permanecem pendentes.

`GET /api/capabilities` declara checkout/pagamentos desativados; `POST /api/orders` e `/api/payments/*` respondem 503, sem pedido/pagamento fictício. Listagem de pedidos mostra apenas dados presentes no schema isolado. O adaptador Mercado Pago presente em `src/mercado-pago.js` não está ligado a rotas nem persistência: requer inbox durável, reconciliação, criação transacional do pedido, estoque/reservas, estornos, ledger, homologação e credenciais antes de ativar Pix. Não há split nem cartão.

## Segurança e operação

- CORS aceita apenas a origem explicitamente configurada. Apps nativos usam bearer sem CORS. HTTPS é responsabilidade do ingresso/Cloud Run/ALB.
- Helmet, payload máximo 32 KiB, validação estrita Zod, SQL parametrizado, owner scopes e erros sanitizados.
- Rate limit é local: 120 requisições/minuto/IP. Para múltiplas instâncias configure limitador compartilhado Redis ou WAF. `trust proxy` não está habilitado: configure somente cadeia de proxies conhecida antes de ingressos compartilhados.
- O papel/disabled é relido do banco em cada requisição. Valores role/claims enviados pelo cliente não concedem privilégios.
- Pool máximo 10 conexões, conexão 5 s e statement timeout 10 s. Dimensionar réplicas contra limite do PostgreSQL; 10 mil conexões simultâneas não foram testadas.
- Logger não recebe token/body nem mensagens SQL; auditar/reter/excluir dados pessoais exige política operacional e rotas futuras.
- Schema não contém dados iniciais: sem catálogo autenticado conectado ao banco, o feed legitimamente fica vazio.

## Evidência

Testes usam HTTP real local e adaptadores de banco/token injetados para verificar validação, autenticação, escopo de usuário, SQL parametrizado, transação de carrinho e fechamento seguro do checkout. Não são homologação Firebase/Mercado Pago nem testes executados em PostgreSQL real. Estes testes não provam isolamento SQL runtime, 80% de cobertura, desempenho mobile ou capacidade de produção. O serviço exige integração adicional em staging antes de exposição pública.
