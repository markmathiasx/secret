# setup-mdh-clean.ps1
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "MDH 3D - SETUP AUTOMATICO" -ForegroundColor Cyan
Write-Host ""

Set-Location D:\mdh-3d-store

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local" -ErrorAction SilentlyContinue
    Write-Host ".env.local criado a partir de .env.example" -ForegroundColor Green
} else {
    Write-Host ".env.local ja existe, nao sobrescrevi" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Agora vou abrir o projeto no VS Code..." -ForegroundColor Cyan
code .

Write-Host ""
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "Iniciando servidor local..." -ForegroundColor Cyan
Write-Host "Loja: http://localhost:3000" -ForegroundColor Green
Write-Host "Painel admin: http://localhost:3000/painel-mdh-85/login" -ForegroundColor Green
npm run dev
