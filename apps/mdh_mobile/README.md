# MDH 3D mobile — fonte em integração

Cliente Flutter Material 3 com temas claro/escuro, layout limitado a 1200px em tablets, grid adaptável, texto escalável, rótulos de acessibilidade, pesquisa textual e categorias reais da API. Paginação explícita evita carregar o catálogo inteiro. Fotos são URLs HTTPS do catálogo; não há imagens inventadas, avaliações ou contadores fabricados. O visualizador aparece só quando existe `modelUrl` HTTPS; AR está desligada.

## Estado verificável

Este módulo contém código-fonte e testes, **não um binário homologado ou app publicado**. O cliente de compra sincroniza a sacola autenticada, relê preços e disponibilidade do servidor, seleciona ou cadastra endereço, cria pedido com chave de idempotência, solicita Pix, apresenta QR/copia-e-cola, retoma pedido pendente e consulta o pagamento. A API declara `checkout:false` e `payments:false` quando o provedor ou suas configurações não estão ativos e responde HTTP 503; nesse estado a interface informa o bloqueio e não cria pedido fictício. A conta permite consultar até 100 pedidos reais e gerenciar endereços com token Firebase por requisição. E-mail verificado e permissões continuam sendo exigidos pelo servidor.

A retomada grava em `SharedPreferences` somente IDs de endereço/pedido/pagamento e uma chave aleatória de idempotência, em chave escopada por origem e UID. Token Firebase, senha, endereço completo, código Pix e QR não são persistidos pelo módulo. A sessão continua sob responsabilidade do SDK Firebase da plataforma.

## Preparação e execução

Requer Flutter stable com Dart >=3.9. No diretório do módulo:

```bash
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=API_BASE_URL=https://api.seudominio.com
```

Os projetos nativos Android e iOS estão versionados. Configure rede HTTPS e políticas de privacidade. O visualizador usa WebView: valide carregamento de GLB real, Content Security Policy e CORS no storage. Nunca exponha arquivos de clientes publicamente.

`API_BASE_URL` vazio abre tela de configuração; não se assume que o site atual tenha os endpoints novos. Aceita somente origem HTTPS sem credenciais, path, query ou fragmento. Em debug aceita HTTP exclusivamente localhost, 127.0.0.1 e 10.0.2.2; não distribuir essa configuração.

## Firebase opcional

O login permanece indisponível até os quatro parâmetros públicos serem fornecidos. O backend deve usar o MESMO projeto Firebase e verificar tokens/roles no servidor. Chaves Firebase de cliente não são credenciais administrativas; nenhuma chave de serviço pertence ao app.

```bash
flutter run \
  --dart-define=API_BASE_URL=https://api.seudominio.com \
  --dart-define=FIREBASE_API_KEY=PUBLIC_CLIENT_API_KEY \
  --dart-define=FIREBASE_APP_ID=PLATFORM_SPECIFIC_APP_ID \
  --dart-define=FIREBASE_PROJECT_ID=PROJECT_ID \
  --dart-define=FIREBASE_SENDER_ID=SENDER_ID
```

Email/senha, cadastro, recuperação e envio de verificação estão implementados no cliente Firebase. Google e Apple são opcionais, **desligados por padrão**, ativados via `ENABLE_GOOGLE_AUTH=true` e `ENABLE_APPLE_AUTH=true` somente após configurar provedores, OAuth client IDs, certificados SHA Android, URL schemes iOS e entitlement Apple. Mudanças de UID na sessão Firebase limpam o estado em memória e restauram apenas o escopo da nova conta. Erros ao persistir no aparelho são apresentados ao usuário. IDs de aplicativo diferem entre iOS/Android. É necessária homologação em dispositivo real. Não há login Facebook/SMS nesta versão. Contas existentes do site não são automaticamente ligadas ao Firebase.

## Contrato

- `GET /api/categories` → `{items:[{id,name}]}`.
- `GET /api/products?limit=24&categoryId=...&q=...&cursor=...` → `{items,nextCursor}`.
- Produto: `id,title,description,priceCents,stock,imageUrl,modelUrl`.
- `GET /api/me` com token Firebase → perfil autorizado pelo servidor.
- `GET /api/orders` → `{items}` com `id,status,totalCents,createdAt`, até 100 registros.
- `GET /api/addresses` → `{items}`; `POST /api/addresses` cadastra; `DELETE /api/addresses/:id` exclui somente do proprietário autenticado.
- `GET /api/cart`; `PUT /api/cart/items/:id`; `DELETE /api/cart/items/:id` sincronizam a sacola autenticada e devolvem totais recalculados.
- `POST /api/orders` recebe `addressId` e `Idempotency-Key`; aceita pedido direto ou envelope `{order}`.
- `POST /api/payments/pix` recebe `orderId` e chave idempotente própria; `GET /api/payments/:id` consulta o estado autoritativo. A resposta aceita pagamento direto ou envelope `{payment}` com `id`/`paymentId`, `status`, `qrCode`, `qrCodeBase64` e `expiresAt`.
- Todas as operações têm timeout de 15 segundos incluindo o corpo da resposta; erros 400/401/403/404/409/422/503 recebem mensagens sem revelar o corpo interno. Testes MockClient cobrem serialização, token por requisição, idempotência, erros HTTP e corpo inválido.

Sem resposta de rede válida, o app apresenta erro e retry, nunca catálogo vazio como falsa evidência de consulta bem-sucedida. A sacola local é apenas a intenção: o resumo do checkout sempre vem da releitura autenticada do servidor. O cliente só libera a criação quando `/api/capabilities` confirma carrinho, endereços, pedidos, checkout e pagamentos.

## Gates de lançamento

Em 25/10/2026, o projeto foi validado com Flutter 3.47.7/Dart 3.13.5: `flutter analyze` sem problemas e 22 testes aprovados. O target `ios/` foi gerado e revisado estruturalmente. A compilação Android produziu um AAB de 53,7 MB antes do bloqueio de assinatura; como não existe keystore privado neste computador, o Gradle agora falha fechado em qualquer nova tarefa release sem `android/key.properties`. A workflow manual `native-marketplace.yml` exige segredos, produz AAB assinado e compila iOS sem codesign em macOS. Publicação continua exigindo homologação em dispositivos, Firebase/API reais, privacidade/exclusão, notificações, Play Console, App Store Connect e credenciais dos proprietários.

```bash
flutter build appbundle --release --dart-define=API_BASE_URL=https://api.seudominio.com
flutter build ipa --release --dart-define=API_BASE_URL=https://api.seudominio.com
```

IPA exige macOS/Xcode, App Store Connect, provisioning e assinatura. Android exige keystore privado e Play Console. Dados de assinatura não devem ser commitados. Produtos físicos e arquivos digitais precisam de fluxos de cobrança avaliados separadamente conforme políticas das lojas; o checkout bloqueado evita cobrar fora de uma integração homologada.
