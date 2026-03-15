param(
    [string]$ProjectPath = "D:\mdh-3d-store",
    [switch]$IncludePublicSupabaseAuth
)

function Write-Section($title) {
    Write-Host ""
    Write-Host "==== $title ====" -ForegroundColor Cyan
}

function Ensure-Dir($path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Force -Path $path | Out-Null
    }
}

Write-Section "Preparando base de stack"
Write-Host "Projeto: $ProjectPath"

if (-not (Test-Path $ProjectPath)) {
    Write-Host "ERRO: caminho do projeto não encontrado: $ProjectPath" -ForegroundColor Red
    exit 1
}

Set-Location $ProjectPath

Ensure-Dir "infra"
Ensure-Dir "infra\checklists"
Ensure-Dir "docs"

$envSample = @'
# =========================
# MDH 3D - production sample
# Stack canonica: Next.js + Drizzle + PostgreSQL/Supabase via DATABASE_URL + /admin
# =========================

# Site
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=5521920137249
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/mdh_impressao3d/
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Banco principal
# Em Supabase, use Connect > Session pooler e prefira a variante IPv4
DATABASE_URL=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=

# Pagamento
PIX_KEY=
PIX_RECEIVER_NAME=
PIX_RECEIVER_CITY=RIO DE JANEIRO
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
'@

if ($IncludePublicSupabaseAuth) {
    $envSample += @'

# Auth publica opcional, fora do funil principal
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
'@
}

Set-Content -Path ".env.production.sample" -Value $envSample -Encoding UTF8

$vercelChecklist = @'
VERCEL - PASSO A PASSO
1. Criar conta na Vercel
2. Importar o repositório GitHub
3. Deploy inicial
4. Abrir Project Settings > Environment Variables
5. Preencher as variáveis da .env.production.sample
6. Fazer redeploy depois de alterar env vars
'@

$supabaseChecklist = @'
SUPABASE - PASSO A PASSO
1. Criar projeto
2. Copiar Project URL
3. Copiar anon/publishable key
4. Copiar service_role/secret key (somente servidor)
5. Se usar auth Google, configurar provider Google
6. Se usar storage, criar bucket
7. Se usar tabelas do app, ativar policies/RLS
'@

$paymentsChecklist = @'
PAGAMENTOS - PASSO A PASSO
1. Configurar PIX_KEY, PIX_RECEIVER_NAME e PIX_RECEIVER_CITY
2. Se quiser cartao no lancamento, configurar Mercado Pago
3. Se nao houver token do Mercado Pago, a loja continua com Pix + WhatsApp
'@

Set-Content -Path "infra\checklists\01-vercel.txt" -Value $vercelChecklist -Encoding UTF8
Set-Content -Path "infra\checklists\02-supabase.txt" -Value $supabaseChecklist -Encoding UTF8
Set-Content -Path "infra\checklists\03-payments.txt" -Value $paymentsChecklist -Encoding UTF8

$readme = @'
MDH 3D - STACK ENXUTA RECOMENDADA

Ordem recomendada:
1. Vercel
2. Supabase
3. Pix
4. Mercado Pago (opcional)
5. GA4 (opcional)

Arquivos gerados:
- .env.production.sample
- infra/checklists/*.txt

Próximo passo:
- abrir os checklists
- preencher as envs obrigatórias
- preencher env vars na Vercel
- redeployar
'@

Set-Content -Path "docs\stack-enxuta-readme.txt" -Value $readme -Encoding UTF8

Write-Section "Arquivos gerados"
Write-Host ".env.production.sample"
Write-Host "docs\stack-enxuta-readme.txt"
Get-ChildItem "infra\checklists" | ForEach-Object { Write-Host $_.FullName }

Write-Section "Próximo passo"
Write-Host "1. Abra docs\stack-enxuta-readme.txt"
Write-Host "2. Siga os arquivos em infra\checklists"
Write-Host "3. Preencha a .env.production.sample"
Write-Host "4. Cadastre as mesmas variáveis na Vercel"
Write-Host "5. Faça redeploy"
