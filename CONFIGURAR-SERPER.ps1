$ErrorActionPreference = "Stop"

$key = Read-Host "Cole sua SERPER_API_KEY"
if ([string]::IsNullOrWhiteSpace($key)) {
  throw "Chave vazia."
}

$envPath = Join-Path (Get-Location) ".env.local"
if (!(Test-Path $envPath)) {
  "SERPER_API_KEY=" | Set-Content -Encoding UTF8 $envPath
}

$content = Get-Content $envPath -Raw
if ($content -match "(?m)^SERPER_API_KEY=") {
  $content = [regex]::Replace($content, "(?m)^SERPER_API_KEY=.*$", "SERPER_API_KEY=$key")
} else {
  $content = "SERPER_API_KEY=$key`r`n" + $content
}
Set-Content -Encoding UTF8 $envPath $content

Write-Host ""
Write-Host "Chave salva em .env.local" -ForegroundColor Green
Write-Host "Agora rode .\RODAR-BUSCA-IMAGENS-SERPER.ps1"
