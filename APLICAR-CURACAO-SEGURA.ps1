$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Aplicando curacao segura no catalogo..." -ForegroundColor Cyan
node .\scripts\apply-safe-csv-media.mjs

Write-Host ""
Write-Host "Gerando relatorio de itens CSV ainda sem midia local..." -ForegroundColor Cyan
node .\scripts\report-uncurated-csv-products.mjs

Write-Host ""
Write-Host "Agora rode:" -ForegroundColor Green
Write-Host "npm run dev"
Write-Host "ou"
Write-Host "npm run build"
