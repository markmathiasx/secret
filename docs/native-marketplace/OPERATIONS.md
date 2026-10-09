# Configuração e implantação

## Estado inicial

Fonte e testes não significam serviço hospedado. Esta entrega não migra o banco do site, não publica nas lojas e não muda o domínio existente. O ambiente novo precisa de banco dedicado, Firebase configurado e deploy de API com TLS antes de conectar o app.

## API local/staging

```sh
cd services/marketplace-api
npm ci
npm test
npm run check
```

Consultar README da API para variáveis e comando de migration efetivamente implementados. Usar PostgreSQL descartável para validar SQL antes de staging. Revisar migration, backup e plano de reversão antes de qualquer banco remoto. Nunca executar reset na base do site.

Foi incluído Dockerfile com Node24, usuário sem privilégios e healthcheck. Build da imagem **não executado neste ambiente**, que não tem Docker disponível. A imagem de runtime não contém migrations e não altera schema ao iniciar. Em máquina/CI com Docker, executar a partir do diretório da API:

```sh
docker build -t mdh-marketplace-api:staging .
docker run --rm -p 8080:8080 --env-file /private/path/api-staging.env mdh-marketplace-api:staging
```

O arquivo de ambiente é privado e deve conter somente configuração de staging. Em Cloud Run, preferir identidade de workload para Firebase e secret manager para conexão do banco; não copiar JSON administrativo para a imagem. Publicar primeiro staging e testar `/health`, `/api/capabilities`, catálogo e ownership autenticado antes de promover qualquer tráfego público.

Configuração esperada: conexão PostgreSQL privada; projeto Firebase; credencial via identidade de workload do host (preferível a JSON de chave). Segredos pertencem ao secret manager, nunca ao app ou Git. `MERCADOPAGO_ACCESS_TOKEN` e `MERCADOPAGO_WEBHOOK_SECRET` não habilitam checkout enquanto faltarem ledger/inbox/reconciliation.

## Flutter

Instalar SDK estável e toolchains seguindo a documentação oficial. Se não houver diretórios nativos na fonte entregue, gerar scaffolding local, mantendo lib/test/pubspec:

```sh
cd apps/mdh_mobile
flutter create --platforms=android,ios --org br.com.mdh3d .
flutter pub get
flutter analyze
flutter test
flutter doctor -v
```

Configurar Firebase para os dois aplicativos, habilitar provedores e registrar certificados/redirects; seguir README do app para os valores aceitos. Executar com `API_BASE_URL` igual à **origem HTTPS da nova API**, sem `/api` no fim. Não usar mdh3d.com.br como se ele já tivesse as novas rotas. Cache tem escopo separado por origem/conta; compra offline não é autorizada.

No Android, configurar keystore privado de upload e Play App Signing; nunca versionar key.properties/chave. No macOS, configurar Bundle ID, Apple Developer Team, certificados/provisioning, Sign in with Apple e APNs. Linux não gera IPA assinada de produção. Gerar AAB/IPA somente depois de análise/testes e assinatura própria; jamais distribuir release assinado com chave debug.

## Infraestrutura de destino

Primeira implantação: API em Cloud Run com Cloud SQL PostgreSQL privado e IAM Firebase. Pool reduzido por réplica, limite de instâncias alinhado ao banco; Redis gerenciado para limiter global/filas quando esses componentes forem implementados. Alternativa ECS/RDS mantém mesmas fronteiras. WebSocket de longa duração precisa de estratégia explícita de reconexão e infraestrutura compatível, não uma Function HTTP curta.

Mídia pública verificada em CDN; uploads/modelos privados em bucket separado com URLs assinadas e scan. HTTPS no edge, acesso ao banco privado, mínimos privilégios. Workers separados com DLQ, retries exponenciais e idempotência. Deploy da API precede rollout do app, com versões compatíveis e migrations expand/contract.

CI: instalação por lockfile, teste/syntax da API, validação SQL em PG descartável e teste Flutter/analyze. Release: artifacts imutáveis, secrets via OIDC, aprovação de ambientes, migrations compatíveis e smoke autenticado. Nenhum job proposto deve ser confundido com pipeline já executado; evidências ficam em VERIFICATION.md.

## Observabilidade e operação

Request ID em API/worker, logs JSON sem PII/token. Medir disponibilidade/p95, falha de pagamento, eventos atrasados, erro de auth, fila/DLQ, pool/locks, estoque inconsistente e conversão por etapa. Sentry/Datadog são integrações futuras a configurar com scrubbing e consentimento apropriados. Alertas têm runbook e responsável.

Backups automáticos/PITR e restore ensaiado com tempo registrado. Falha de gateway: bloquear novas intenções, manter pedidos pendentes, reconciliar por ID. Falha de fila: não enviar notificações que afirmem estado não confirmado. Rollback reverte artefato compatível; dados financeiros corrigem por compensação, não apagamento.

## Lojas e privacidade

Preparar descrição, screenshots reais, política pública de privacidade, exclusão de conta, formulários de dados, conteúdo/idade, credenciais de revisão e suporte. Produtos físicos e conteúdo digital STL têm tratamento de cobrança diferente nas políticas das lojas; validar antes de liberar checkout digital. TestFlight/Play fechado precedem rollout gradual. Contas, contratos de gateway/logística e credenciais de assinatura são dependências reais, não geradas pela IA.

## Fontes primárias

- https://docs.flutter.dev/deployment/android
- https://docs.flutter.dev/deployment/ios
- https://firebase.google.com/docs/auth/admin/verify-id-tokens
- https://www.mercadopago.com.br/developers/en/docs/checkout-api-orders/resources/split-payments-1-n
- https://developer.apple.com/app-store/review/guidelines/
- https://support.google.com/googleplay/android-developer/answer/9858738
