$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "1) Corrigindo BOM em arquivos JSON..." -ForegroundColor Cyan
node .\scripts\fix-json-bom.mjs

Write-Host ""
Write-Host "2) Instalando dependências..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "3) Baixando só as pendentes reais..." -ForegroundColor Cyan
node .\scripts\fill-images-serpapi-pending.mjs

Write-Host ""
Write-Host "4) Abrindo a loja local..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit','-Command','cd "' + (Get-Location).Path + '"; npm run dev'
Start-Sleep -Seconds 12
Start-Process "http://localhost:3000/catalogo?mode=all"

Write-Host ""
Write-Host "Concluído. Se a página não abrir sozinha, acesse http://localhost:3000/catalogo?mode=all" -ForegroundColor Green
