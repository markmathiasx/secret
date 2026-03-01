param(
  [switch]$AfterCodex
)

$ProjectPath = "D:\mdh-3d-store"
if (-not (Test-Path $ProjectPath)) {
  Write-Error "Projeto não encontrado em $ProjectPath"
  exit 1
}

Set-Location $ProjectPath

if (-not $AfterCodex) {
  Write-Host "==> Preparando validação local" -ForegroundColor Cyan
  npm.cmd install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host "==> Build de validação" -ForegroundColor Cyan
  npm.cmd run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host "==> Estrutura de mídia local" -ForegroundColor Cyan
  New-Item -ItemType Directory -Force "$ProjectPath\public\media" | Out-Null
  New-Item -ItemType Directory -Force "$ProjectPath\public\backgrounds" | Out-Null
  New-Item -ItemType Directory -Force "$ProjectPath\public\products" | Out-Null

  Write-Host "Pronto. Agora cole o prompt no Codex." -ForegroundColor Green
  exit 0
}

Write-Host "==> Pós-Codex: build e preparo para push" -ForegroundColor Cyan
npm.cmd install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm.cmd run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Arquivos alterados" -ForegroundColor Cyan
git status --short

Write-Host "\nSe estiver tudo certo, rode:" -ForegroundColor Yellow
Write-Host 'git add .' -ForegroundColor Yellow
Write-Host 'git commit -m "feat: upgrade login, auth UX, conversion, and social growth"' -ForegroundColor Yellow
Write-Host 'git push origin main' -ForegroundColor Yellow
