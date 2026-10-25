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
export TRUST_PROXY='1' # somente quando houver exatamente um proxy/ingresso confiável
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

`POST /api/webhooks/mercadopago` exige JSON de até 8 KiB e correspondência entre `data.id` do corpo e da query. Valida `x-signature`, `x-request-id`, segredo mínimo e janela antirreplay antes de consultar banco ou provedor. Um advisory lock transacional serializa o mesmo `request-id`; reentrega idêntica não consulta novamente o Mercado Pago e reutilização do identificador para outro pagamento retorna 409. A resposta autoritativa do provedor também precisa corresponder ao ID assinado. Somente essa reconciliação move o pedido para `paid`; reembolso/chargeback move para `refunded`. O serviço não implementa cartão, split, estorno iniciado pela API ou repasse a vendedores.

## Segurança e operação

- CORS aceita apenas a origem explicitamente configurada. Apps nativos usam bearer sem CORS. HTTPS é responsabilidade do ingresso/Cloud Run/ALB.
- Helmet, JSON estrito, limite global de 16 KiB, webhook de 8 KiB e limites menores por mutação (1 KiB checkout/carrinho, 4 KiB endereço e 16 KiB produto). Tipo diferente de `application/json` recebe 415; excesso recebe 413.
- Rate limits locais e separados: global 300/min/IP, health 30, catálogo 120, autenticação 60, leituras privadas 120/usuário, mutações 30/usuário, checkout 10/usuário e webhook 60/IP. Para múltiplas instâncias, o ingresso/WAF ou store compartilhado continua obrigatório. `TRUST_PROXY=1` só deve ser usado atrás de exatamente um proxy confiável.
- O papel/disabled é relido do banco em cada requisição. Valores role/claims enviados pelo cliente não concedem privilégios.
- Pool máximo 10 conexões, conexão 5 s e statement timeout 10 s. O servidor limita headers a 16 KiB, headers a 10 s, requisição a 20 s, keep-alive a 5 s e 100 requisições por socket. Firebase tem deadline de 5 s; Mercado Pago, 10 s e resposta máxima de 256 KiB.
- Logs forenses registram request ID interno, rota sem query, status, duração e hashes curtos de IP/usuário. Token, corpo, e-mail, query, IDs dinâmicos e mensagens de exceção não são registrados. Política de retenção e acesso continua sendo obrigação operacional.
- Credenciais Mercado Pago nunca são retornadas pela API. Injete-as por Secret Manager e use credenciais de teste com `MERCADOPAGO_LIVE_MODE=false` durante homologação.
- Schema não contém dados iniciais: sem catálogo autenticado conectado ao banco, o feed legitimamente fica vazio.

## Evidência

Testes usam HTTP real local e adaptadores de banco/token injetados para verificar validação, autenticação, escopo de usuário, SQL parametrizado, transação de carrinho e fechamento seguro do checkout. Não são homologação Firebase/Mercado Pago nem testes executados em PostgreSQL real. Estes testes não provam isolamento SQL runtime, 80% de cobertura, desempenho mobile ou capacidade de produção. O serviço exige integração adicional em staging antes de exposição pública.
