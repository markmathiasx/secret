# MDH 3D Store Pro

Loja full-stack da **MDH 3D** para impressões 3D sob encomenda com:

- catálogo com **1000 exemplos**;
- páginas individuais de produto;
- frete por CEP para RJ;
- bot no próprio site + WhatsApp com handoff para humano;
- painel admin oculto em rota separada;
- financeiro com gráfico e export CSV;
- PWA instalável no iPhone/Android;
- base pronta para Mercado Pago;
- login social/OTP opcional via Supabase.

## Dados já ajustados

- Instagram: **mdh___021**
- E-mail atendimento: **mdhatendimento@gmail.com**
- E-mail admin: **markmathias01@gmail.com**
- Pix provider: **PicPay**
- Exibição de confirmação: **CPF final 85**
- Painel admin oculto: **/painel-mdh-85/login**

## Rodar local no Windows com PowerShell 7

Dentro da pasta `D:\mdh-3d-store`:

```powershell
./setup-mdh.ps1
```

## Passo manual resumido

```powershell
Set-Location D:\mdh-3d-store
Copy-Item .env.example .env.local -ErrorAction SilentlyContinue
code .
npm install
npm run dev
```

Site público:

```text
https://example.com
```

Painel admin:

```text
https://example.com/painel-mdh-85/login
```

## Antes de publicar

Edite o `.env.local` e troque pelo menos:

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`
- `NEXT_PUBLIC_FACEBOOK_URL`
- `PIX_KEY`, `PIX_RECEIVER_NAME` e `PIX_RECEIVER_CITY`
- variáveis do WhatsApp Cloud API, se já for usar
- variáveis do Mercado Pago, se já for usar

## Supabase é opcional

O site funciona **sem** Supabase.

Você só precisa configurar estas chaves se quiser:

- login com Google
- login com Apple
- link mágico por e-mail
- OTP por telefone/SMS/WhatsApp
- persistência real de pedidos/orçamentos no Supabase

Campos do `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ORDERS_TABLE=orders
SUPABASE_QUOTES_TABLE=quotes
```

Campos do Pix privado no backend:

```env
PIX_KEY=21974137662
PIX_RECEIVER_NAME=MARK MATHIAS DO SACRAMENTO VIDAL
PIX_RECEIVER_CITY=RIO DE JANEIRO
```

## Mídia

Coloque seus arquivos em:

```text
public/media
```

Formatos recomendados:

- `.mp4`
- `.webm`
- `.mov`

Sugestões de vídeo:

- timelapse de impressão
- close de acabamento
- antes/depois de pintura
- entrega no RJ
- vídeos curtos para tráfego vindo de anúncio

A home detecta até 6 arquivos automaticamente.

## Publicar no GitHub

```powershell
./publish-mdh.ps1
```

O script pede a URL do repositório e faz o push inicial.

## Limite importante

Este projeto **não inclui cópia automática de imagens, vídeos ou modelos de terceiros** (MakerWorld, Amazon, Mercado Livre, Shopee, AliExpress, YouTube etc.). Para usar mídia real desses lugares, verifique licença, API oficial e permissão de uso. A base visual e comercial já está pronta para você substituir pelos seus próprios arquivos.


## Novidade visual

- Todos os itens do catálogo agora têm previews locais gerados no próprio projeto.
- Clique em qualquer produto para ampliar a galeria ilustrativa.
- Quando quiser, troque as previews pelas suas fotos reais ou vídeos em `public/media`.


## Deixar online sem depender do PC

1. Rode `./publish-mdh.ps1` para subir no GitHub.
2. Importe o repositório na Vercel e copie as variáveis do `.env.local`.
3. Faça o primeiro deploy e teste a URL da Vercel.
4. Depois conecte seu domínio na Cloudflare e troque os nameservers no registrador.
5. Mantenha Vercel + Cloudflare: assim o site continua online mesmo com seu PC desligado.
