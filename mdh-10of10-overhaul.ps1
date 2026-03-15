param(
  [switch]$AfterCodex
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = 'D:\mdh-3d-store'
if (!(Test-Path $ProjectRoot)) { throw "Projeto não encontrado em $ProjectRoot" }
Set-Location $ProjectRoot

function Step($msg) {
  Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Warn($msg) {
  Write-Host "[aviso] $msg" -ForegroundColor Yellow
}

function Run($cmd) {
  Write-Host "> $cmd" -ForegroundColor DarkGray
  Invoke-Expression $cmd
}

if (-not $AfterCodex) {
  Step 'Preparando projeto antes do Codex'

  # diretórios de mídia local esperados
  New-Item -ItemType Directory -Force public\media | Out-Null
  New-Item -ItemType Directory -Force public\backgrounds | Out-Null
  New-Item -ItemType Directory -Force public\products | Out-Null

  # arquivos que não deveriam ser versionados
  $gitignore = Join-Path $ProjectRoot '.gitignore'
  $entries = @(
    '.env.local',
    '.next',
    'node_modules',
    'tsconfig.tsbuildinfo'
  )
  foreach ($e in $entries) {
    if (!(Select-String -Path $gitignore -Pattern "^$([regex]::Escape($e))$" -Quiet -ErrorAction SilentlyContinue)) {
      Add-Content $gitignore "`n$e"
    }
  }

  Step 'Status atual'
  Run 'git branch --show-current'
  Run 'git status --short'

  Step 'Validação rápida de mídia local'
  $expected = @(
    'public\media\hero-printer-loop.mp4',
    'public\media\finishing-closeup.mp4',
    'public\backgrounds\hero-printer-fallback.jpg'
  )
  foreach ($path in $expected) {
    if (Test-Path $path) {
      Write-Host "OK  $path" -ForegroundColor Green
    } else {
      Warn "faltando: $path"
    }
  }

  Step 'Varredura rápida por sinais de template/demo'
  $patterns = @('1000 exemplos', 'Abrir os 1000 exemplos', 'For You', 'Household', 'Hobby & DIY', 'Miniatures', 'public/media', 'placeholder')
  foreach ($p in $patterns) {
    $matches = Get-ChildItem src -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.mdx 2>$null | Select-String -Pattern $p -SimpleMatch
    if ($matches) {
      Warn "encontrado: $p"
    }
  }

  Step 'Instalação e baseline'
  Run 'npm.cmd install'
  Warn 'Agora cole o prompt 10/10 no Codex. Quando ele terminar, rode este mesmo script com -AfterCodex.'
  exit 0
}

Step 'Validação pós-Codex'
Run 'npm.cmd install'
Run 'npm.cmd run build'

Step 'Typecheck adicional'
try {
  Run 'npx tsc --noEmit'
} catch {
  Warn 'tsc retornou erro; revise o terminal acima.'
  throw
}

Step 'Status do repositório'
Run 'git status --short'

Step 'Busca por sinais remanescentes de template/demo'
$patterns = @('1000 exemplos', 'Abrir os 1000 exemplos', 'For You', 'Household', 'Hobby & DIY', 'Miniatures', 'placeholder', 'public/media')
foreach ($p in $patterns) {
  $matches = Get-ChildItem src -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.mdx 2>$null | Select-String -Pattern $p -SimpleMatch
  if ($matches) {
    Warn "ainda encontrado: $p"
  }
}

Step 'Confirmação de assets chave'
$expected = @(
  'public\media\hero-printer-loop.mp4',
  'public\media\finishing-closeup.mp4',
  'public\backgrounds\hero-printer-fallback.jpg'
)
foreach ($path in $expected) {
  if (Test-Path $path) {
    Write-Host "OK  $path" -ForegroundColor Green
  } else {
    Warn "faltando: $path"
  }
}

Step 'Próximos comandos sugeridos'
Write-Host 'git add .' -ForegroundColor Green
Write-Host 'git commit -m "feat: 10of10 commercial redesign and conversion overhaul"' -ForegroundColor Green
Write-Host 'git push -u origin HEAD' -ForegroundColor Green
