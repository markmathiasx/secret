$projectPath = "D:\mdh-3d-store"
$envPath = Join-Path $projectPath ".env.local"

if (!(Test-Path $projectPath)) {
    Write-Error "Pasta do projeto não encontrada: $projectPath"
    exit 1
}

$envContent = @"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=COLE_A_ANON_KEY_AQUI
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=COLE_A_PUBLISHABLE_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=COLE_A_SERVICE_ROLE_KEY_AQUI
SUPABASE_SECRET_KEY=COLE_A_SECRET_KEY_AQUI
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
"@

Set-Content -Path $envPath -Value $envContent -Encoding UTF8

Write-Host "Arquivo criado/atualizado: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ficou em branco." -ForegroundColor Yellow
Write-Host "O site deve ser corrigido para funcionar com fallback sem Google Maps até você criar essa chave." -ForegroundColor Yellow
Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Cyan
Write-Host "cd D:\mdh-3d-store"
Write-Host "npm.cmd install"
Write-Host "npm.cmd run build"
Write-Host "npm.cmd run dev"

notepad $envPath
