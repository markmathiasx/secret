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
if ($envText -match 'ADMIN_PASSWORD=troque-por-uma-senha-forte') {
  Write-Host 'ATENCAO: troque a linha ADMIN_PASSWORD no .env.local antes de publicar.' -ForegroundColor Yellow
}
if ($envText -match 'ADMIN_SESSION_TOKEN=troque-por-um-token-grande-e-aleatorio') {
  Write-Host 'ATENCAO: troque a linha ADMIN_SESSION_TOKEN no .env.local antes de publicar.' -ForegroundColor Yellow
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
Write-Host 'Site publico:        https://example.com' -ForegroundColor White
Write-Host 'Painel admin oculto: https://example.com/painel-mdh-85/login' -ForegroundColor White
Write-Host 'Login cliente:       https://example.com/login' -ForegroundColor White

Write-Step '7) Observacoes importantes'
Write-Host 'Google/Apple/SMS so funcionam quando voce preencher o Supabase no .env.local e ativar os providers.' -ForegroundColor Yellow
Write-Host 'Sem Supabase o site continua funcionando normalmente, inclusive catalogo, frete, bot e WhatsApp.' -ForegroundColor Yellow
Write-Host 'Para deixar online sem depender do seu PC, publique no GitHub + Vercel. Depois use Cloudflare no dominio.' -ForegroundColor Yellow
Write-Host 'Para a home mostrar videos, jogue arquivos .mp4/.webm em public/media.' -ForegroundColor Yellow

Write-Step '8) Subindo o servidor local'
npm run dev
