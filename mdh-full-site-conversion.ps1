param(
  [switch]$AfterCodex
)

$ProjectPath = "D:\mdh-3d-store"
if (!(Test-Path $ProjectPath)) {
  Write-Error "Projeto não encontrado em $ProjectPath"
  exit 1
}

Set-Location $ProjectPath

function Show-Section($text) {
  Write-Host "`n==> $text" -ForegroundColor Cyan
}

if (-not $AfterCodex) {
  Show-Section "Preparando validação antes do Codex"
  Write-Host "Projeto: $ProjectPath"
  Write-Host "Node: $(node -v 2>$null)"
  Write-Host "NPM:  $(npm.cmd -v 2>$null)"

  if (!(Test-Path ".env.local")) {
    Write-Warning ".env.local não encontrado. O build pode falhar por falta de variáveis."
  }

  Show-Section "Conferindo arquivos de mídia locais"
  $paths = @(
    "public\media\hero-printer-loop.mp4",
    "public\media\finishing-closeup.mp4",
    "public\backgrounds\hero-printer-fallback.jpg"
  )
  foreach ($p in $paths) {
    if (Test-Path $p) { Write-Host "OK  $p" -ForegroundColor Green }
    else { Write-Warning "Faltando: $p" }
  }

  Show-Section "Status Git"
  git status --short

  Show-Section "Pronto para colar o prompt no Codex"
  Write-Host "Quando o Codex terminar, rode este mesmo script com -AfterCodex"
  exit 0
}

Show-Section "Validando depois do Codex"

Show-Section "Instalando dependências"
npm.cmd install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Show-Section "Executando build"
npm.cmd run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Show-Section "Status Git após mudanças"
git status --short

Write-Host "`nTudo certo. Próximos comandos sugeridos:" -ForegroundColor Green
Write-Host 'git add .'
Write-Host 'git commit -m "feat: full-site commercial redesign and UX overhaul"'
Write-Host 'git push -u origin HEAD'
