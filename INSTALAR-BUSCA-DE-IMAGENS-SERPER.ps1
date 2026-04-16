$ErrorActionPreference = "Stop"

$repo = Get-Location
$packagePath = Join-Path $repo "package.json"
$scriptPath = Join-Path $repo "scripts\fill-images-serper.mjs"
$manifestPath = Join-Path $repo "data\catalog-photo-manifest.json"

if (!(Test-Path $packagePath)) {
  throw "package.json não encontrado nesta pasta. Entre na raiz do projeto."
}

if (!(Test-Path $scriptPath)) {
  throw "scripts\fill-images-serper.mjs não encontrado. Extraia o ZIP por cima do projeto."
}

if (!(Test-Path $manifestPath)) {
  throw "data\catalog-photo-manifest.json não encontrado."
}

$pkg = Get-Content $packagePath -Raw | ConvertFrom-Json
$pkg.scripts | Add-Member -NotePropertyName "catalog:fill-images" -NotePropertyValue "node scripts/fill-images-serper.mjs" -Force
$pkg | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $packagePath

if (!(Test-Path ".env.local")) {
@"
SERPER_API_KEY=
FILL_MODE=conceptual-only
FILL_KIND=imagem-conceitual
FILL_EXTRA_QUERY=3d print product figure
FILL_MAX_ITEMS=50
FILL_SKIP_IDS=mdh-001,mdh-002
FILL_ONLY_IDS=
"@ | Set-Content -Encoding UTF8 ".env.local"
}

Write-Host ""
Write-Host "Instalado para SERPER." -ForegroundColor Green
Write-Host "Agora rode .\CONFIGURAR-SERPER.ps1"
