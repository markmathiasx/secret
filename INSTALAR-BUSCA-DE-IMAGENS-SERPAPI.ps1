$ErrorActionPreference = "Stop"

$repo = Get-Location
$packagePath = Join-Path $repo "package.json"
$scriptPath = Join-Path $repo "scripts\fill-images-serpapi.mjs"
$manifestPath = Join-Path $repo "data\catalog-photo-manifest.json"

if (!(Test-Path $packagePath)) {
  throw "package.json não encontrado nesta pasta. Entre na raiz do projeto."
}

if (!(Test-Path $scriptPath)) {
  throw "scripts\fill-images-serpapi.mjs não encontrado. Extraia o ZIP por cima do projeto."
}

if (!(Test-Path $manifestPath)) {
  throw "data\catalog-photo-manifest.json não encontrado."
}

$pkg = Get-Content $packagePath -Raw | ConvertFrom-Json
$pkg.scripts | Add-Member -NotePropertyName "catalog:fill-images" -NotePropertyValue "node scripts/fill-images-serpapi.mjs" -Force
$pkg | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $packagePath

Write-Host ""
Write-Host "Instalado para SERPAPI." -ForegroundColor Green
Write-Host "Agora rode .\RODAR-BUSCA-IMAGENS-SERPAPI.ps1"
