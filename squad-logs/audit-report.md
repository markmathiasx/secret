# Auditoria MDH 3D Store

Data: 2026-04-21

## P0

### 1. Chat público expõe conversas por `thread_id` e aceita envio de mensagens sem autenticação

**Impacto:** qualquer pessoa que descubra ou reutilize um `thread_id` consegue ler o histórico completo de uma conversa e também injetar novas mensagens como cliente. Isso afeta inbox, chat, contexto comercial e privacidade de compradores.

**Evidência:**
- `app/api/chat/route.ts:41-55` aceita `send_message` com `thread_id` e `visitor_id` arbitrários, sem sessão/autorização.
- `app/api/chat/route.ts:95-103` devolve a sessão inteira quando recebe `thread_id`, também sem autenticação.
- `lib/live-chat-service.ts:277-314` retorna todas as mensagens da thread.
- `components/live-chat-widget.tsx:24-39` e `components/live-chat-widget.tsx:235-241` persistem `threadId` no `localStorage`, ampliando o risco de reaproveitamento do identificador.

### 2. Webhook do WhatsApp processa POST sem validar assinatura da Meta

**Impacto:** um atacante pode postar payloads falsos no webhook, gravar mensagens no inbox, criar threads e ainda disparar respostas de saída pelo número oficial da loja, gerando custo, spam e poluição operacional.

**Evidência:**
- `app/api/webhooks/whatsapp/route.ts:101-113` valida apenas o handshake `GET`.
- `app/api/webhooks/whatsapp/route.ts:258-356` processa qualquer `POST` recebido.
- `app/api/webhooks/whatsapp/route.ts:115-143` envia mensagens para a API do WhatsApp sem checagem prévia de assinatura/origem.
- Não há leitura/verificação de cabeçalhos de assinatura (`x-hub-signature-256` ou equivalente) no arquivo.

## P1

### 1. Catálogo público continua expondo itens `BLOCKED`/placeholder em massa

**Impacto:** a vitrine pública continua mostrando itens cuja própria auditoria semântica marcou como bloqueados/placeholders. Isso quebra honestidade visual, catálogo público e SEO de produto.

**Evidência:**
- `output/CATALOG_SEMANTIC_AUDIT.json:3-12` registra `248` itens totais, `213` bloqueados e `210` conjuntos placeholder.
- `app/catalogo/page.tsx:45-48` e `app/catalogo/page.tsx:103-105` afirmam explicitamente que a vitrine pública mostra o catálogo completo, sem esconder produto por tipo de mídia.
- `lib/catalog-repository.ts:174-200` entrega o snapshot completo do catálogo sem filtrar por segurança de mídia.
- `components/catalog-grid.tsx:27-40` renderiza itens mesmo quando `publicSafe` é falso; apenas troca estilo visual.
- `components/product-image-gallery.tsx:48-52` e `components/product-image-gallery.tsx:100-104` mostram itens inseguros com aviso, em vez de bloqueá-los do catálogo público.

### 2. PDP busca produto privado do banco por slug/id sem exigir `visibility = PUBLIC`

**Impacto:** um produto privado pode ficar acessível publicamente por URL direta se o slug ou id for conhecido. Isso afeta catálogo, preview privado e SEO.

**Evidência:**
- `lib/catalog-repository.ts:159-171` filtra `visibility: ProductVisibility.PUBLIC` apenas no snapshot público.
- `lib/catalog-repository.ts:220-243` faz `findFirst` por `slug`/`id` na PDP sem o mesmo filtro de visibilidade.
- `app/catalogo/[slug]/page.tsx:100-104` publica a PDP sempre que `findCatalogProductBySlug` retornar um registro.

### 3. Rastreio de pedido expõe dados sensíveis com base apenas em código previsível

**Impacto:** com um código de pedido válido, o endpoint devolve nome do cliente, total, status, QR/Pix payload, tracking e metadados de pagamento sem autenticação nem rate limit. O código segue padrão previsível (`MDH-YYYYMMDD-####`), reduzindo o esforço de enumeração.

**Evidência:**
- `app/api/orders/route.ts:118-120` gera códigos no formato `MDH-YYYYMMDD-####`.
- `app/api/orders/track/route.ts:19-25` aceita consulta pública apenas com `code`.
- `app/api/orders/track/route.ts:61-99` devolve `customerName`, `grandTotal`, `pixPayload`, `pixQrCode`, `boletoUrl`, `tracking` e `metadata`.
- Não há autenticação nem rate limit no endpoint `app/api/orders/track/route.ts`.

### 4. Parte do admin quebra para sessões válidas de `mdh_admin` por autenticação inconsistente

**Impacto:** o login admin principal cria cookie próprio `mdh_admin`, mas várias APIs críticas do painel exigem `auth()`/Auth.js. Resultado provável: admin logado no fluxo oficial consegue abrir páginas server-side, mas recebe `401` em operações de pedidos, pagamentos e invoices.

**Evidência:**
- `app/api/admin/login/route.ts:72-92` cria a sessão admin no cookie `mdh_admin`.
- `lib/server-session.ts:138-146` reconhece `mdh_admin` como sessão administrativa válida.
- `app/api/admin/orders/route.ts:5-9` usa `auth()` em vez de `getServerSessionUser()`.
- `app/api/admin/orders/[id]/route.ts:8-12` e `app/api/admin/orders/[id]/route.ts:35-39` também usam `auth()`.
- `app/api/admin/payments/confirm/route.ts:9-13` e `app/api/admin/invoices/route.ts:5-9` / `41-45` repetem o mesmo padrão incompatível.

### 5. Sitemap indexa o catálogo completo, inclusive itens sem mídia pública segura

**Impacto:** mesmo quando a mídia é bloqueada/placeholder, a URL do produto continua sendo emitida no sitemap. Isso amplia a superfície de indexação de páginas que o próprio projeto já classificou como inadequadas para exposição pública.

**Evidência:**
- `app/sitemap.ts:8-9` carrega todo o snapshot público disponível.
- `app/sitemap.ts:34-39` gera entradas para todos os produtos sem filtro de mídia segura.
- `lib/catalog-repository.ts:174-200` pode servir o catálogo estático completo como fallback.
- `output/CATALOG_SEMANTIC_AUDIT.json:3-12` mostra que a maioria do acervo auditado está bloqueada/placeholder.

## P2

### 1. `lastModified` do sitemap está hardcoded para todas as páginas

**Impacto:** o sitemap envia um sinal SEO artificialmente estático para home, páginas institucionais e todos os produtos, reduzindo qualidade do freshness signal.

**Evidência:**
- `app/sitemap.ts:10` fixa `const buildDate = new Date('2026-04-19')`.
- `app/sitemap.ts:27-39` reaproveita a mesma data em todas as URLs.

### 2. Middleware trata presença de cookie compartilhado como suficiente para atravessar áreas protegidas

**Impacto:** não é bypass completo por si só porque várias rotas revalidam no servidor, mas a borda libera `/admin`, `/seller` e `/conta` pela mera presença de cookie de sessão compartilhado. Isso reduz defesa em profundidade e aumenta o impacto de qualquer handler esquecido.

**Evidência:**
- `middleware.ts:16-27` e `middleware.ts:36-53` consideram qualquer cookie Auth.js/shared como sessão suficiente.
- `middleware.ts:131-141` permite seguir para áreas protegidas com esse critério antes de a rota fazer checagem fina.

### 3. Layout global injeta widgets pesados em toda a navegação pública

**Impacto:** chat, assistant, cart drawer, PWA e pixel são montados no layout raiz para todas as páginas. Isso pressiona o bundle inicial da storefront, inclusive em catálogo, PDP e checkout.

**Evidência:**
- `app/layout.tsx:15-20` importa widgets/client components globais.
- `app/layout.tsx:189-216` renderiza `CartDrawer`, `SiteAssistant`, `LiveChatWidget`, `PwaRegister`, `CookieConsent` e `FacebookPixel` no layout raiz.
- `npm run build` nesta auditoria reportou `First Load JS` de ~`393-398 kB` para `/catalogo`, `/catalogo/[slug]` e `/checkout`.

