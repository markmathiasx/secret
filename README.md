# MDH 3D Store

Loja Next.js da MDH 3D com:

- catálogo e páginas individuais de produto;
- orçamento rápido e fluxo para imagem/modelo 3D;
- consultor comercial com IA via Responses API compatível com OpenAI, Groq e Ollama, além de fallback guiado;
- área do cliente com login local por e-mail e senha;
- painel administrativo em `/admin`;
- integrações opcionais com Supabase, Mercado Pago e WhatsApp Cloud API.

## Rodar local

```powershell
Set-Location D:\mdh-3d-store
Copy-Item .env.example .env.local -ErrorAction SilentlyContinue
npm install
npm run dev
```

## Variáveis mínimas

Configure no `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=seu-email@dominio.com
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=seu-segredo-longo
AUTH_CUSTOMER_SESSION_SECRET=seu-segredo-longo
AUTH_MAX_CUSTOMERS=100
AUTH_MAX_ADMINS=5
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.1
AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
```

Se quiser bootstrap inicial do admin por senha em texto puro, use `ADMIN_PASSWORD` apenas no primeiro acesso e remova depois.

## Login e segurança

- Em produção, contas de clientes e registros de pedido usam Supabase.
- O cofre local `secret/auth-users.json` fica apenas como fallback de desenvolvimento.
- Senhas ficam em hash `scrypt` no servidor.
- Sessões de cliente e admin usam cookies `HttpOnly` assinados.
- O painel administrativo usa `/admin/login`.
- A chave Pix pública do front pode ser definida em `NEXT_PUBLIC_PIX_KEY`.
- O webhook do Mercado Pago usa `external_reference` igual ao código do pedido para reconciliação.

## Produção recomendada

Configure estas variáveis no projeto da Vercel:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_QUOTE_REQUESTS_TABLE=quote_requests
NEXT_PUBLIC_PIX_KEY=21974137662
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.1
AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
```

Sem `SUPABASE_SERVICE_ROLE_KEY`, pedidos e orçamentos não gravam no banco.
Sem `MERCADOPAGO_ACCESS_TOKEN`, o site mantém o fluxo do cartão preparado, mas devolve fallback orientando Pix ou WhatsApp.
Sem `MERCADOPAGO_WEBHOOK_SECRET`, o site ainda recebe notificações, mas perde a validação criptográfica da assinatura do webhook.
Sem um provedor de IA configurado (`GROQ_API_KEY`, `OPENAI_API_KEY` ou modo local via Ollama), o consultor do site continua funcionando em modo guiado.

## Consultor IA

- O backend do site usa um cliente compatível com `Responses API`, permitindo operar com OpenAI, Groq e Ollama sem trocar o fluxo do produto.
- Para produção com custo zero inicial, a recomendação prática é `AI_PROVIDER=groq` com `GROQ_MODEL=llama-3.1-8b-instant`.
- Para operação local/offline no próprio PC, a recomendação é `AI_PROVIDER=ollama` com `OLLAMA_MODEL=qwen3:4b-q4_K_M`.
- `Ollama` roda na sua máquina; isso serve para ambiente local ou servidor próprio, não para a Vercel pública sem um host acessível externamente.
- O caminho OpenAI continua suportado com `OPENAI_MODEL=gpt-5.1` por padrão e possibilidade de troca para `gpt-5.4-pro`.
- O fluxo usa ferramentas locais para consultar catálogo, autenticação visual do item, pagamento, entrega e personalização.
- Se o provedor não estiver configurado ou atingir limite, o modal do consultor entra automaticamente em fallback guiado, sem quebrar a experiência.

## Saúde do projeto

- `npm run doctor` verifica ambiente, provider de IA e conflitos de merge em `app`, `components`, `lib` e `scripts`.
- `GET /api/health` devolve um resumo operacional seguro com status da IA, pagamentos, catálogo e integração com Supabase.

## Checks

```powershell
npm run typecheck
npm run lint:check
npm run build
npm run doctor
npm run validate
```

## Deploy

GitHub:

```powershell
git add .
git commit -m "feat: secure local auth and admin hardening"
git push origin main
```

Vercel:

```powershell
vercel env add AUTH_CUSTOMER_SESSION_SECRET production
vercel env add AUTH_CUSTOMER_SESSION_SECRET preview
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add MERCADOPAGO_ACCESS_TOKEN production
vercel --prod
```

Use `vercel env pull` para sincronizar o ambiente local com o projeto da Vercel.
