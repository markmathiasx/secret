# API mobile MDH — checkout transacional com Pix

Node 24/25, Express 5, PostgreSQL e Firebase Admin. Esta API é separada do site: não migra automaticamente contas, preços, catálogo ou pedidos existentes. Não publica imagens ilustrativas nem importa anúncios de concorrentes. Produtos só aparecem se `published=true`, o vendedor estiver habilitado e existirem dados reais cadastrados.

## Execução local

```sh
npm ci
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/ISOLATED_DATABASE'
export FIREBASE_PROJECT_ID='your-project'
export GOOGLE_APPLICATION_CREDENTIALS='/private/path/service-account.json'
export ALLOWED_ORIGIN='https://your-reviewed-web-admin.example'
export MERCADOPAGO_ACCESS_TOKEN='read-from-secret-manager'
export MERCADOPAGO_NOTIFICATION_URL='https://api.example.com/api/webhooks/mercadopago'
export MERCADOPAGO_WEBHOOK_SECRET='read-from-secret-manager'
export MERCADOPAGO_COLLECTOR_ID='numeric-account-id'
export MERCADOPAGO_LIVE_MODE='false'
npm run migrate
npm run catalog:dry-run
npm run catalog:import
npm start
npm test
npm audit --omit=dev
```

Execute dentro deste diretório. Nunca coloque credenciais no Git. A migration cria apenas `mdh_marketplace`; não executa reset nem copia tabelas do site. Revise o SQL, confirme o projeto, execute primeiro em banco de teste e faça backup antes de qualquer migração remota. O comando `migrate` é inicial/idempotente; evolução de schema exige migrations numeradas e controle de versões antes de uso contínuo em produção.

Firebase Admin verifica revogação do token. Cadastro é gerenciado pelos SDKs Firebase no app; esta API materializa o perfil no primeiro acesso. E-mail não verificado recebe 403. Login por telefone pode não ter e-mail. Novos perfis são compradores. Papel de vendedor/admin só pode ser atribuído por operação confiável de administração do banco; não existe promoção pública. A configuração de Google/Apple/Facebook/SMS e apps autorizados é externa e ainda necessária.

O importador usa `directSaleCatalog` do catálogo estático do site, mantém associação estável em `legacy_id`, aceita somente mídia já classificada para venda direta e grava relatório em `output/native-marketplace-catalog-import.json`. O modo padrão é `dry-run`; `catalog:import` exige `DATABASE_URL`, usa transação e upsert idempotente. Itens com licença ou mídia pendente permanecem rejeitados, sem substituição por imagens geradas.

## Contrato

`openapi.json` documenta o contrato. Listagem de produtos aceita `categoryId`, `productType`, `game`, `character`, `q`, `cursor` UUID e `limit` (1–50); resposta `{items,nextCursor}`. Busca é substring literal parametrizada em título, descrição e tags, com ordem por UUID, não relevância/personalização. Listas de endereços, categorias, produtos do vendedor e pedidos usam `{items}`. Carrinho usa `{items,totalCents}`. Dinheiro inteiro em centavos. Preço é sempre obtido do servidor, não do payload do comprador.

O carrinho limita 100 linhas e 99 unidades por linha; adicionar não reserva estoque. Edição do vendedor exige propriedade do produto mesmo para papel admin; registra auditoria dentro da mesma transação. Criação pelo vendedor usa POST e proprietário atribuído pelo servidor, com auditoria transacional. Admin global, exclusão definitiva de produtos, uploads, logística, cupons, chat, reviews, pagamento, reserva, cancelamento e notificações ainda não estão implementados. Edição recebe objeto completo via PUT. Cadastro inicial pode ser realizado com POST por um vendedor autorizado; importação em lote e a interface administrativa permanecem pendentes.

`GET /api/capabilities` só declara checkout/Pix ativos quando todas as configurações obrigatórias do Mercado Pago são válidas. Sem credenciais completas, `POST /api/orders`, `POST /api/payments/pix` e o webhook respondem 503 antes de criar estado comercial.

`POST /api/orders` exige `Idempotency-Key` e `{addressId}`. A transação serializável bloqueia carrinho e produtos, relê preço/disponibilidade, cria snapshot dos itens/endereço, reserva estoque físico, limpa o carrinho e registra auditoria. Produtos sob encomenda não recebem estoque fictício. A mesma chave e o mesmo payload retornam o pedido original; reutilização com payload diferente retorna 409.

`POST /api/payments/pix` exige nova `Idempotency-Key` e `{orderId}`. A tentativa é persistida antes da chamada externa e a mesma chave é enviada ao Mercado Pago. Quedas entre o provedor e o banco podem ser repetidas sem criar cobrança nova. QR Code só é retornado após resposta real do provedor; falhas ficam gravadas com código sanitizado. Pedidos expirados são cancelados e o estoque físico é restituído uma única vez.

`POST /api/webhooks/mercadopago` valida `x-signature`, `x-request-id` e janela antirreplay, consulta o pagamento diretamente no Mercado Pago e compara ID, pedido, moeda, recebedor, ambiente e valor persistidos. Somente essa reconciliação autoritativa move o pedido para `paid`; reembolso/chargeback move para `refunded`. A inbox durável torna reentregas idempotentes. O serviço não implementa cartão, split, estorno iniciado pela API ou repasse a vendedores.

## Segurança e operação

- CORS aceita apenas a origem explicitamente configurada. Apps nativos usam bearer sem CORS. HTTPS é responsabilidade do ingresso/Cloud Run/ALB.
- Helmet, payload máximo 32 KiB, validação estrita Zod, SQL parametrizado, owner scopes e erros sanitizados.
- Rate limit é local: 120 requisições/minuto/IP. Para múltiplas instâncias configure limitador compartilhado Redis ou WAF. `trust proxy` não está habilitado: configure somente cadeia de proxies conhecida antes de ingressos compartilhados.
- O papel/disabled é relido do banco em cada requisição. Valores role/claims enviados pelo cliente não concedem privilégios.
- Pool máximo 10 conexões, conexão 5 s e statement timeout 10 s. Dimensionar réplicas contra limite do PostgreSQL; 10 mil conexões simultâneas não foram testadas.
- Logger não recebe token/body nem mensagens SQL; auditar/reter/excluir dados pessoais exige política operacional e rotas futuras.
- Credenciais Mercado Pago nunca são retornadas pela API. Injete-as por Secret Manager e use credenciais de teste com `MERCADOPAGO_LIVE_MODE=false` durante homologação.
- Schema não contém dados iniciais: sem catálogo autenticado conectado ao banco, o feed legitimamente fica vazio.

## Evidência

Testes usam HTTP real local e adaptadores de banco/token injetados para verificar validação, autenticação, escopo de usuário, SQL parametrizado, transação de carrinho e fechamento seguro do checkout. Não são homologação Firebase/Mercado Pago nem testes executados em PostgreSQL real. Estes testes não provam isolamento SQL runtime, 80% de cobertura, desempenho mobile ou capacidade de produção. O serviço exige integração adicional em staging antes de exposição pública.
