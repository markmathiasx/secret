$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host 'MDH 3D - Publicacao GitHub (PowerShell 7)' -ForegroundColor Green

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw 'Git nao encontrado. Instale o Git primeiro.'
}

Write-Host "`n1) Conferindo repositorio..." -ForegroundColor Cyan
if (-not (Test-Path '.git')) {
  git init
  Write-Host 'Repositorio Git criado.' -ForegroundColor Yellow
} else {
  Write-Host 'Repositorio Git ja existe.' -ForegroundColor Yellow
}

Write-Host "`n2) Adicionando arquivos..." -ForegroundColor Cyan
git add .

Write-Host "`n3) Criando commit..." -ForegroundColor Cyan
git commit -m "MDH 3D - publish" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Nenhum arquivo novo para commit ou commit anterior ja feito. Vou continuar.' -ForegroundColor Yellow
}

git branch -M main

$repoUrl = Read-Host "`n4) Cole a URL HTTPS do seu repositorio GitHub (ex: https://github.com/SEU_USUARIO/mdh-3d-store.git)"
if ([string]::IsNullOrWhiteSpace($repoUrl)) {
  throw 'URL do repositorio nao informada.'
}

Write-Host "`n5) Vinculando origin..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $repoUrl

Write-Host "`n6) Fazendo push..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`nGitHub concluido com sucesso." -ForegroundColor Green
Write-Host "`nProximo passo na Vercel:" -ForegroundColor Cyan
Write-Host '1. Acesse https://vercel.com/new' -ForegroundColor White
Write-Host '2. Clique em Import Git Repository' -ForegroundColor White
Write-Host '3. Escolha o repositorio mdh-3d-store' -ForegroundColor White
Write-Host '4. Em Environment Variables, copie tudo do seu .env.local' -ForegroundColor White
Write-Host '5. Clique em Deploy' -ForegroundColor White
Write-Host '6. Teste o dominio temporario gerado pela Vercel' -ForegroundColor White
Write-Host "`nDepois, se quiser, eu posso te orientar no Cloudflare passo a passo." -ForegroundColor Yellow
