$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "1) Ajustando package.json para Prisma 6 compatível..." -ForegroundColor Cyan
node .\scripts\patch-package-json-prisma6.mjs

Write-Host ""
Write-Host "2) Instalando dependências..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "3) Gerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "4) Validando build..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "5) Status do git..." -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "Concluído. Agora rode .\ABRIR-E-VALIDAR-ROTAS.ps1 para abrir as telas-chave." -ForegroundColor Green
