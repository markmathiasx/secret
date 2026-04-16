$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "1) Instalando dependências que faltam para subir o storefront..." -ForegroundColor Cyan
npm install next-auth bcryptjs otplib nodemailer @auth/prisma-adapter @prisma/client prisma

Write-Host ""
Write-Host "2) Gerando Prisma client..." -ForegroundColor Cyan
npx prisma generate
