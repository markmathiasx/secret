$ErrorActionPreference = "Stop"

$repo = Get-Location
$packagePath = Join-Path $repo "package.json"
$scriptPath = Join-Path $repo "scripts\import-real-photos.mjs"
$dataDir = Join-Path $repo "data"
$manifestPath = Join-Path $dataDir "catalog-photo-manifest.json"
$inputDir = Join-Path $repo "input\real-photos"

if (!(Test-Path $packagePath)) {
  throw "package.json não encontrado em $repo"
}

if (!(Test-Path $scriptPath)) {
  throw "scripts\import-real-photos.mjs não encontrado em $repo"
}

if (!(Test-Path $dataDir)) {
  New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

if (!(Test-Path $manifestPath)) {
  "[]" | Set-Content -Encoding UTF8 $manifestPath
}

if (!(Test-Path $inputDir)) {
  New-Item -ItemType Directory -Path $inputDir -Force | Out-Null
}

$pkg = Get-Content $packagePath -Raw | ConvertFrom-Json
$pkg.scripts | Add-Member -NotePropertyName "catalog:import-real" -NotePropertyValue "node scripts/import-real-photos.mjs" -Force
$pkg | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $packagePath

Write-Host ""
Write-Host "Patch aplicado." -ForegroundColor Green
Write-Host "Script: scripts/import-real-photos.mjs"
Write-Host "Manifesto: data/catalog-photo-manifest.json"
Write-Host "Entrada de fotos: input/real-photos"
Write-Host ""
Write-Host "Agora rode:"
Write-Host "npm install"
Write-Host "npm run catalog:import-real"
Write-Host "npm run build"
