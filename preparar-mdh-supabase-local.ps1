Set-Location D:\mdh-3d-store

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

$envFile = Join-Path (Get-Location) '.env.local'

@"
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Banco oficial do app
# Em Supabase, use a Session pooler IPv4 em Connect > Session pooler
DATABASE_URL=

# Auth admin canonica
ADMIN_EMAIL=admin@mdh3d.local
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=troque-por-um-segredo-longo-e-aleatorio

# Pagamentos
PIX_KEY=
PIX_RECEIVER_NAME=MDH 3D
PIX_RECEIVER_CITY=RIO DE JANEIRO
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

# Browser auth publica opcional
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
"@ | Set-Content -Path $envFile -Encoding UTF8

Write-Host "Created/updated .env.local at $envFile"
Write-Host "Now open the file, paste your real keys, save, then run the commands below."

notepad $envFile

Write-Host ""
Write-Host "After saving .env.local, run:" -ForegroundColor Cyan
Write-Host "npm.cmd install"
Write-Host "npm.cmd run doctor"
Write-Host "npm.cmd run db:generate"
Write-Host "npm.cmd run dev"
