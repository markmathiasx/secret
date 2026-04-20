param(
  [string]$RepoPath = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
Set-Location $RepoPath

$schemaFiles = @()
if (Test-Path ".\prisma\schema.prisma") { $schemaFiles += ".\prisma\schema.prisma" }
$schemaFiles += Get-ChildItem ".\prisma" -Filter "*.prisma" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName

$symbols = @(
  "Address",
  "CatalogEventType",
  "PaymentMethod",
  "PaymentProvider",
  "PaymentStatus",
  "ShipmentStatus",
  "OrderStatus",
  "MediaType",
  "ProductStatus",
  "ProductVisibility",
  "Role",
  "User"
)

$report = [System.Collections.Generic.List[string]]::new()
$report.Add("=== AUDITORIA PRISMA ===")
$report.Add("Repo: $RepoPath")
$report.Add("Data: $(Get-Date -Format s)")
$report.Add("")

if (-not $schemaFiles.Count) {
  $report.Add("ERRO: Nenhum schema Prisma encontrado em .\prisma")
} else {
  $report.Add("Schemas encontrados:")
  foreach ($f in $schemaFiles) { $report.Add(" - $f") }
  $report.Add("")

  foreach ($symbol in $symbols) {
    $found = $false
    foreach ($file in $schemaFiles) {
      $content = Get-Content $file -Raw
      if ($content -match "(?m)\b(model|enum)\s+$symbol\b") {
        $found = $true
        $report.Add("[OK] $symbol encontrado em $(Split-Path $file -Leaf)")
        break
      }
    }
    if (-not $found) {
      $report.Add("[MISSING] $symbol não existe no schema atual")
    }
  }
}

$reportPath = ".\reports\prisma-schema-audit.txt"
$report | Set-Content $reportPath -Encoding UTF8
Write-Host "Relatório salvo em $reportPath" -ForegroundColor Green

Write-Host ""
Write-Host "Rodando prisma validate..." -ForegroundColor Cyan
try {
  npx prisma validate
} catch {
  Write-Host "prisma validate falhou" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Rodando prisma generate..." -ForegroundColor Cyan
try {
  npx prisma generate
} catch {
  Write-Host "prisma generate falhou" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Primeiras linhas do relatório:" -ForegroundColor Cyan
Get-Content $reportPath | Select-Object -First 40
