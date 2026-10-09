# MDH 3D mobile — fonte em integração

Cliente Flutter Material 3 com temas claro/escuro, layout limitado a 1200px em tablets, grid adaptável, texto escalável, rótulos de acessibilidade, pesquisa textual e categorias reais da API. Paginação explícita evita carregar o catálogo inteiro. Fotos são URLs HTTPS do catálogo; não há imagens inventadas, avaliações ou contadores fabricados. O visualizador aparece só quando existe `modelUrl` HTTPS; AR está desligada.

## Estado verificável

Este módulo contém código-fonte e testes, **não um binário homologado ou app publicado**. Dart do SDK Flutter 3.35.4 foi instalado e `dart format lib test` passou (4 arquivos). A preparação do Flutter/dependências foi interrompida após bloqueio da revisão automática de acesso à rede; nenhuma tentativa de contornar esse bloqueio foi realizada. `flutter analyze`, `flutter test`, compilação Android e iOS permanecem obrigatórios e não são apresentados como executados. O formatter sinalizou dependência `flutter_lints` ainda não resolvida; formatação não comprova tipagem ou compilação. O carrinho/favoritos são locais, isolados por origem de API e UID Firebase. Persistência é JSON em SharedPreferences, exclusivamente dados de catálogo; não grava senhas ou tokens nesse armazenamento. O SDK Firebase gerencia a persistência da sessão autenticada segundo a plataforma; essa persistência deve ser incluída na revisão de privacidade e segurança. Checkout é desabilitado. Não existe pagamento, histórico, sincronização de carrinho ou cache offline de catálogo nesta versão.

## Preparação e execução

Requer Flutter stable com Dart >=3.9. No diretório do módulo:

```bash
flutter create --platforms=android,ios --org br.com.mdh3d --project-name mdh_mobile .
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=API_BASE_URL=https://api.seudominio.com
```

O primeiro comando gera os projetos nativos padrão; não foi executado nesta entrega. Antes de executá-lo, mantenha este código versionado e revise o diff gerado. Configure permissão INTERNET no manifesto Android, rede HTTPS e políticas de privacidade. O visualizador usa WebView: valide carregamento de GLB real, Content Security Policy e CORS no storage. Nunca exponha arquivos de clientes publicamente.

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

Sem resposta de rede válida, o app apresenta erro e retry, nunca catálogo vazio como falsa evidência de consulta bem-sucedida. Carrinho é estimativa; o servidor deve recalcular valores e estoque para qualquer pagamento futuro. Nenhuma chamada neste cliente cria pedidos.

## Gates de lançamento

Gerar e revisar scaffolds nativos, fixar `pubspec.lock` após `flutter pub get`, testar fonte e widget em SDK suportado, Android/iOS em dispositivos, acessibilidade e filtros; configurar Firebase/API reais; implementar checkout, privacidade/exclusão, notificações e operações obrigatórias. Só então:

```bash
flutter build appbundle --release --dart-define=API_BASE_URL=https://api.seudominio.com
flutter build ipa --release --dart-define=API_BASE_URL=https://api.seudominio.com
```

IPA exige macOS/Xcode, App Store Connect, provisioning e assinatura. Android exige keystore privado e Play Console. Dados de assinatura não devem ser commitados. Produtos físicos e arquivos digitais precisam de fluxos de cobrança avaliados separadamente conforme políticas das lojas; o checkout bloqueado evita cobrar fora de uma integração homologada.
