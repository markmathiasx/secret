$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host "As imagens do catálogo já estão inclusas localmente em public/catalog-assets." -ForegroundColor Green
Write-Host "Se quiser substituir depois por fotos reais, mantenha o padrão mdh-1-1.webp, mdh-1-2.webp, mdh-1-3.webp etc." -ForegroundColor Yellow
Write-Host "Pasta: $PSScriptRoot\public\catalog-assets" -ForegroundColor Cyan
