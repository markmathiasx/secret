$ErrorActionPreference = 'Stop'

function Write-Step($text) {
  Write-Host "`n=== $text ===" -ForegroundColor Cyan
}

Set-Location $PSScriptRoot
Write-Host 'MDH 3D - Setup local (PowerShell 7)' -ForegroundColor Green
Write-Host "Pasta atual: $PSScriptRoot" -ForegroundColor DarkGray

Write-Step '1) Verificando Node.js, npm e Git'
node -v
npm -v
if (Get-Command git -ErrorAction SilentlyContinue) {
  git --version
} else {
  Write-Host 'Git nao encontrado agora. O site roda sem Git, mas voce vai precisar dele para publicar no GitHub.' -ForegroundColor Yellow
}

Write-Step '2) Criando .env.local se necessario'
if (-not (Test-Path '.env.local')) {
  Copy-Item '.env.example' '.env.local'
  Write-Host '.env.local criado com seus dados base da MDH.' -ForegroundColor Green
} else {
  Write-Host '.env.local ja existe. Vou manter e corrigir campos antigos conhecidos.' -ForegroundColor Yellow
  (Get-Content '.env.local' -Raw).Replace('mark___021','mdh___021').Replace('contato@mdh3d.com.br','mdhatendimento@gmail.com') | Set-Content '.env.local' -Encoding UTF8
}

Write-Step '3) Conferindo campos obrigatorios do admin'
$envText = Get-Content '.env.local' -Raw
if ($envText -match 'ADMIN_PASSWORD_HASH=' -and $envText -notmatch 'ADMIN_PASSWORD_HASH=.+') {
  Write-Host 'ATENCAO: gere e preencha ADMIN_PASSWORD_HASH no .env.local antes de operar o painel.' -ForegroundColor Yellow
}
if ($envText -match 'ADMIN_SESSION_SECRET=troque-por-um-segredo-longo-e-aleatorio') {
  Write-Host 'ATENCAO: troque ADMIN_SESSION_SECRET no .env.local antes de operar o painel.' -ForegroundColor Yellow
}
if ($envText -match 'DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/mdh3d') {
  Write-Host 'ATENCAO: revise a DATABASE_URL. Em Supabase prefira Session pooler IPv4 em Connect > Session pooler.' -ForegroundColor Yellow
}

Write-Step '4) Abrindo no VS Code (se disponivel)'
if (Get-Command code -ErrorAction SilentlyContinue) {
  code .
  code .env.local
} else {
  Write-Host 'Comando code nao encontrado. Abra manualmente a pasta no VS Code.' -ForegroundColor Yellow
}

Write-Step '5) Instalando dependencias'
npm install

Write-Step '6) Como acessar'
Write-Host 'Site publico:        http://localhost:3000' -ForegroundColor White
Write-Host 'Painel admin:        http://localhost:3000/admin/login' -ForegroundColor White
Write-Host 'Login cliente:       http://localhost:3000/login (opcional)' -ForegroundColor White

Write-Step '7) Observacoes importantes'
Write-Host 'O funil principal de venda usa DATABASE_URL + Drizzle + Postgres/Supabase. Admin e pedido real nao operam sem banco.' -ForegroundColor Yellow
Write-Host 'Login/conta publica por Supabase continuam opcionais e fora do caminho principal de compra.' -ForegroundColor Yellow
Write-Host 'Para deixar online sem depender do seu PC, publique no GitHub + Vercel. Depois use Cloudflare no dominio.' -ForegroundColor Yellow
Write-Host 'Para a home mostrar videos, jogue arquivos .mp4/.webm em public/media.' -ForegroundColor Yellow

Write-Step '8) Subindo o servidor local'
npm run dev
