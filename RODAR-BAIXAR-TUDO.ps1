$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Bootstrap do storefront..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File .\BOOTSTRAP-STOREFRONT.ps1

Write-Host ""
Write-Host "Baixando imagens CSV pendentes..." -ForegroundColor Cyan
node .\scripts\fill-csv-curated-images-serpapi.mjs

Write-Host ""
Write-Host "Aplicando curacao segura..." -ForegroundColor Cyan
if (Test-Path .\APLICAR-CURACAO-SEGURA.ps1) {
  powershell -ExecutionPolicy Bypass -File .\APLICAR-CURACAO-SEGURA.ps1
} else {
  Write-Host "APLICAR-CURACAO-SEGURA.ps1 não encontrado; seguindo sem ele." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Status git..." -ForegroundColor Cyan
git status --short
