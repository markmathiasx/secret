$projectPath = "D:\mdh-3d-store"
$envPath = Join-Path $projectPath ".env.local"

if (!(Test-Path $projectPath)) {
    Write-Error "Pasta do projeto não encontrada: $projectPath"
    exit 1
}

$envContent = @"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=

ADMIN_EMAIL=admin@mdh3d.local
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=troque-por-um-segredo-longo-e-aleatorio

PIX_KEY=
PIX_RECEIVER_NAME=MDH 3D
PIX_RECEIVER_CITY=RIO DE JANEIRO

NEXT_PUBLIC_WHATSAPP_NUMBER=5521920137249
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/mdh_impressao3d/
NEXT_PUBLIC_GA_MEASUREMENT_ID=

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

# Browser auth opcional, fora do funil principal:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
"@

Set-Content -Path $envPath -Value $envContent -Encoding UTF8

Write-Host "Arquivo criado/atualizado: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Preencha DATABASE_URL com a Session pooler IPv4 do Supabase antes de rodar migrate/seed." -ForegroundColor Yellow
Write-Host "Nao coloque segredos diretamente neste script; use sempre o .env.local." -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "cd D:\mdh-3d-store"
Write-Host "npm.cmd install"
Write-Host "npm.cmd run doctor"
Write-Host "npm.cmd run db:generate"
Write-Host "npm.cmd run db:migrate"
Write-Host "npm.cmd run db:seed"
Write-Host "npm.cmd run dev"

notepad $envPath
