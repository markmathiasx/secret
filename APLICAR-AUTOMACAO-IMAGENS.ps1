$ErrorActionPreference = "Stop"

$repo = Get-Location
$packagePath = Join-Path $repo "package.json"
$scriptPath = Join-Path $repo "scripts\fill-images-serpapi.mjs"
$envExamplePath = Join-Path $repo ".env.images.example"

if (!(Test-Path $packagePath)) {
  throw "package.json não encontrado em $repo"
}

if (!(Test-Path $scriptPath)) {
  throw "scripts\fill-images-serpapi.mjs não encontrado em $repo"
}

$pkg = Get-Content $packagePath -Raw | ConvertFrom-Json
$pkg.scripts | Add-Member -NotePropertyName "catalog:fill-images" -NotePropertyValue "node scripts/fill-images-serpapi.mjs" -Force
$pkg | ConvertTo-Json -Depth 100 | Set-Content -Encoding UTF8 $packagePath

@"
# Copie para .env.local ou defina no PowerShell antes de rodar
SERPAPI_KEY=cole_sua_chave_aqui

# Opções:
# conceptual-only | missing-only | missing-or-conceptual | all
FILL_MODE=missing-or-conceptual

# mantém a classificação honesta
FILL_KIND=imagem-conceitual

# reforço de busca
FILL_EXTRA_QUERY=3d print figure product

# limite por execução
FILL_MAX_ITEMS=50

# ids para pular, separados por vírgula
FILL_SKIP_IDS=mdh-001,mdh-002

# ids específicos, separados por vírgula
# FILL_ONLY_IDS=mdh-008,mdh-009
"@ | Set-Content -Encoding UTF8 $envExamplePath

Write-Host ""
Write-Host "Automação de busca de imagens aplicada." -ForegroundColor Green
Write-Host "Script: scripts/fill-images-serpapi.mjs"
Write-Host "Exemplo de env: .env.images.example"
Write-Host ""
Write-Host "Próximos passos:"
Write-Host "1. Definir SERPAPI_KEY"
Write-Host "2. Ajustar FILL_SKIP_IDS / FILL_ONLY_IDS"
Write-Host "3. Rodar npm run catalog:fill-images"
