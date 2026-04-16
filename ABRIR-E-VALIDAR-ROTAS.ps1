$ErrorActionPreference = "Stop"

$cmd = "cd /d `"$((Get-Location).Path)`" && npm run dev"
Start-Process "cmd.exe" -ArgumentList "/k", $cmd
Start-Sleep -Seconds 12

Start-Process "http://localhost:3000/catalogo"
Start-Process "http://localhost:3000/login"
Start-Process "http://localhost:3000/conta"
Start-Process "http://localhost:3000/checkout"

Write-Host ""
Write-Host "Abri as rotas principais:" -ForegroundColor Green
Write-Host "- /catalogo"
Write-Host "- /login"
Write-Host "- /conta"
Write-Host "- /checkout"
Write-Host ""
Write-Host "Checklist rápido:"
Write-Host "1. Catalogo abre sem erro 500"
Write-Host "2. Login abre com campos de email/senha/2FA"
Write-Host "3. Conta redireciona ou mostra estado de visitante"
Write-Host "4. Checkout abre"
