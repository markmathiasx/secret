# Industrial UI + Auth + Database + Storage Audit

- Commit atual: `95f6112fac9c05fd82e7e182199a4df9d2b8c632`
- Branch atual: `feat/industrial-ui-auth-database-storage`
- Produtos no catalogo real: `564`
- Regra de preco atual: cartao = Pix + R$ 1,00 (confirmado)
- WhatsApp oficial: `5521974137662`
- Instagram correto: `@mdh_3d.com.br`

## Rotas publicas principais

- `/`
- `/[slug]`
- `/atendimento`
- `/auth/callback`
- `/blog`
- `/blog/[slug]`
- `/brindes-e-lotes`
- `/brindes-personalizados-3d`
- `/busca`
- `/carrinho`
- `/catalogo`
- `/catalogo/[slug]`
- `/catalogo/categoria/[slug]`
- `/chaveiros-personalizados`
- `/checkout`
- `/checkout/falha`
- `/checkout/pendente`
- `/checkout/success`
- `/checkout/sucesso`
- `/colecionaveis-geek-3d`
- `/compra-protegida`
- `/decoracao-3d-para-casa`
- `/devolucoes`
- `/divulgacao`
- `/entregas`
- `/falha`
- `/faq`
- `/favoritos`
- `/guia-primeira-impressao-3d`
- `/imagem-para-impressao-3d`
- `/indicacao`
- `/jogue`
- `/login`
- `/loja/[categoria]/[slug]`
- `/organizadores`
- `/peca-sob-medida`
- `/pendente`
- `/politica-de-privacidade`
- `/presentes-3d`
- `/presentes-ate-50`
- `/product/[id]`
- `/rastrear`
- `/recuperar-senha`
- `/recuperar-senha/confirmar`
- `/recuperar-senha/whatsapp`
- `/seller`
- `/setup-e-organizacao-3d`
- `/setup-gamer`
- `/sobre`
- `/sucesso`
- `/termos`
- `/trocas-e-devolucoes`

## Rotas admin existentes

- `/admin`
- `/admin/analytics`
- `/admin/content`
- `/admin/coupons`
- `/admin/coupons/new`
- `/admin/finance`
- `/admin/inbox`
- `/admin/integrations/meta`
- `/admin/inventory`
- `/admin/login`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/products`
- `/admin/products/[id]/edit`
- `/admin/products/new`
- `/admin/settings`
- `/admin/users`

## Rotas auth existentes

- `/admin/login`
- `/api/auth/2fa/confirm`
- `/api/auth/2fa/disable`
- `/api/auth/2fa/setup`
- `/api/auth/[...nextauth]`
- `/api/auth/business-login/callback`
- `/api/auth/business-login/start`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/password-reset/confirm`
- `/api/auth/password-reset/request`
- `/api/auth/password-reset/whatsapp/request`
- `/api/auth/password-reset/whatsapp/verify`
- `/api/auth/register`
- `/api/auth/session`
- `/api/auth/verify-email`
- `/auth/callback`
- `/login`
- `/recuperar-senha`
- `/recuperar-senha/confirmar`
- `/recuperar-senha/whatsapp`

## Prisma e PostgreSQL

- Prisma schema existe com datasource PostgreSQL.
- Modelos (49): User, Account, Session, VerificationToken, PasswordResetRequest, AdminActionLog, Authenticator, BuyerProfile, SellerProfile, Address, Category, Collection, ProductCollection, Product, ProductMedia, ProductVariant, Inventory, Cart, CartItem, Wishlist, WishlistItem, Coupon, Order, OrderItem, Payment, Shipment, Review, CatalogReview, Question, Notification, ChatThread, ChatMessage, CatalogEvent, AnalyticsEvent, UserPersonalization, ProductRecommendation, SEOMetadata, AnalyticsReport, QuoteEstimate, Invoice, QuoteRequest, PushSubscription, AbTestAssignment, NpsSurvey, ProductQuestion, LoyaltyPoint, Referral, FlashSale, PasswordResetOTP.
- Enums (20): Role, ProductStatus, ProductVisibility, ProfitMode, MediaType, InventoryPolicy, CartStatus, OrderStatus, PaymentMethod, PaymentProvider, PaymentStatus, ShipmentStatus, CouponType, NotificationChannel, NotificationStatus, ChatThreadType, ReviewStatus, QuestionStatus, PasswordResetRequestStatus, CatalogEventType.

## Supabase e storage

- Supabase config: existe.
- Migrations Supabase existentes: 7.
- Storage atual: Vercel Blob/upload parcial; provider Supabase dedicado ainda ausente.

## JSONs locais que armazenam dados

- `data/a1-mini-catalog-ids.json`
- `data/a1-mini-expansion-500.json`
- `data/admin-product-overrides.json`
- `data/catalog-photo-manifest.json`
- `data/catalogo_curado_160_itens_ptbr.json`
- `data/csv-curated-media-map.json`
- `data/local-catalog-image-snapshot.json`
- `data/menu3-plus-image-audit.json`
- `data/product-gallery-map.json`
- `data/products.json`
- `data/real-image-status.json`

## APIs/libs que gravam arquivo local ou persistem fallback

- `app/api/checkout/preference/route.ts`
- `app/api/orders/route.ts`
- `app/api/quote/route.ts`

## Estado de paginas exigidas

- /atendimento: existe; usa bot de suporte e catalogo real
- /admin: existe e e protegido
- /login: existe
- /cadastro: ausente
- /perfil: ausente
- /pedidos: ausente
- /conta: existe; cobre perfil/pedidos em rota legada

## Meta feed e jogos

- /meta/catalog.csv: 560 produtos validos, 4 ignorados.
- /jogue: 11/11 nomes esperados encontrados no codigo-fonte de jogos.
- Jogos encontrados: Print Runner 3D, Pinball Star, Filament Catcher, Layer Stack, Nozzle Dodge, Bed Level Master, Support Breaker, Color Swap, Delivery Dash 3D, STL Puzzle, Print Tycoon Mini.

## Termos publicos antigos

- `@mdh_impressao3d`: nenhum match em app
- `(21) 99999-9999`: nenhum match em app
- `fotos reais`: nenhum match em app

## Problemas de visual/layout e fundacao

- Design system industrial ainda nao centralizado em componentes ui/Industrial*.
- Login concentra cadastro e entrada na mesma rota; falta /cadastro dedicado.
- Conta do cliente existe em /conta, mas faltam aliases protegidos /perfil e /pedidos.
- Storage de upload existe, mas nao ha provider abstrato local/supabase dedicado nem API /api/files.
- Admin ja existe, mas ainda nao expoe paginas dedicadas de quotes/storage/audit.

## Observacao Supabase

Consulta feita aos documentos oficiais: RLS deve ser habilitado por tabela publica, policies usam `auth.uid()`/`auth.jwt()` com cuidado, e Storage exige policies em `storage.objects`; service role nunca deve ir para cliente.
