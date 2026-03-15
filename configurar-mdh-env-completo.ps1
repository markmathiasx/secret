$projectPath = "D:\mdh-3d-store"
$envPath = Join-Path $projectPath ".env.local"

if (!(Test-Path $projectPath)) {
    Write-Error "Pasta do projeto não encontrada: $projectPath"
    exit 1
}

$envContent = @"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://jimhpbvmvhgkfrtprvfs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbWhwYnZtdmhna2ZydHBydmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjMwMDQsImV4cCI6MjA4Nzg5OTAwNH0.8LtmzuQMPZmyImPfZ3tg96uP4vm0f7eQkNqS2DDcs0Q
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XhVifww4YdTIXqVL-fA6eg_klyKovbw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbWhwYnZtdmhna2ZydHBydmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMyMzAwNCwiZXhwIjoyMDg3ODk5MDA0fQ.V6P-RwyspwwioJRlePkritX_1tEuO6jVa9NRfEBMrhA
SUPABASE_SECRET_KEY=sb_secret_vkPq-pzhbB1SH4glmZcVRQ_ZuKpqpEy
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
