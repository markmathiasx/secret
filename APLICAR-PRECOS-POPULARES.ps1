$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "1) Aplicando preços populares heurísticos..." -ForegroundColor Cyan
node .\scripts\aplicar-precos-populares.mjs

Write-Host ""
Write-Host "2) Build opcional de validação..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "Concluído." -ForegroundColor Green