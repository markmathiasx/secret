param(
    [switch]$AfterCodex
)

$ProjectPath = "D:\mdh-3d-store"

function Write-Section($title) {
    Write-Host ""
    Write-Host "==== $title ====" -ForegroundColor Cyan
}

function Assert-Path($path) {
    if (-not (Test-Path $path)) {
        Write-Host "ERRO: caminho não encontrado: $path" -ForegroundColor Red
        exit 1
    }
}

Assert-Path $ProjectPath
Set-Location $ProjectPath

if (-not $AfterCodex) {
    Write-Section "Preparação antes do Codex"

    Write-Host "Projeto: $ProjectPath"
    Write-Host "Node:" (node -v)
    Write-Host "NPM:" (npm.cmd -v)

    Write-Section "Conferindo assets locais"
    $assets = @(
        "public\media\hero-printer-loop.mp4",
        "public\media\finishing-closeup.mp4",
        "public\backgrounds\hero-printer-fallback.jpg"
    )

    foreach ($asset in $assets) {
        if (Test-Path $asset) {
            Write-Host "OK  $asset" -ForegroundColor Green
        } else {
            Write-Host "WARN $asset não encontrado" -ForegroundColor Yellow
        }
    }

    Write-Section "Conferindo variáveis importantes no .env.local"
    if (Test-Path ".env.local") {
        $envText = Get-Content ".env.local" -Raw
        $keys = @(
            "NEXT_PUBLIC_SITE_URL",
            "NEXT_PUBLIC_SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
            "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
        )
        foreach ($key in $keys) {
            if ($envText -match "(?m)^$key=") {
                Write-Host "OK  $key" -ForegroundColor Green
            } else {
                Write-Host "WARN $key ausente no .env.local" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "WARN .env.local não encontrado" -ForegroundColor Yellow
    }

    Write-Section "Estado Git"
    git status --short

    Write-Host ""
    Write-Host "Pronto. Agora cole o prompt final no Codex." -ForegroundColor Green
    exit 0
}

Write-Section "Validação depois do Codex"

Write-Section "Busca por textos/template/demo que devem sumir"
$badPatterns = @(
    "1000 exemplos",
    "Abrir os 1000 exemplos",
    "For You",
    "Household",
    "Hobby & DIY",
    "Miniatures",
    "placeholder",
    "public/media"
)

$matchesFound = $false

foreach ($pattern in $badPatterns) {
    $matches = Get-ChildItem -Recurse -File src,public 2>$null | Select-String -Pattern $pattern -SimpleMatch
    if ($matches) {
        $matchesFound = $true
        Write-Host "ENCONTRADO: $pattern" -ForegroundColor Yellow
        $matches | Select-Object -First 5 | ForEach-Object {
            Write-Host ("  " + $_.Path + ":" + $_.LineNumber)
        }
    } else {
        Write-Host "OK  removido: $pattern" -ForegroundColor Green
    }
}

Write-Section "Conferindo metadataBase / NEXT_PUBLIC_SITE_URL"
$envOk = $false
if (Test-Path ".env.local") {
    $envText = Get-Content ".env.local" -Raw
    if ($envText -match "(?m)^NEXT_PUBLIC_SITE_URL=") {
        $envOk = $true
        Write-Host "OK  NEXT_PUBLIC_SITE_URL presente no .env.local" -ForegroundColor Green
    }
}
if (-not $envOk) {
    Write-Host "WARN NEXT_PUBLIC_SITE_URL ausente no .env.local" -ForegroundColor Yellow
}

$metaFiles = Get-ChildItem -Recurse -File src 2>$null | Select-String -Pattern "metadataBase|NEXT_PUBLIC_SITE_URL" -SimpleMatch
if ($metaFiles) {
    Write-Host "OK  referência encontrada para metadata/url" -ForegroundColor Green
    $metaFiles | Select-Object -First 10 | ForEach-Object {
        Write-Host ("  " + $_.Path + ":" + $_.LineNumber + " -> " + $_.Line.Trim())
    }
} else {
    Write-Host "WARN não achei metadataBase/NEXT_PUBLIC_SITE_URL no código" -ForegroundColor Yellow
}

Write-Section "Build"
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: build falhou" -ForegroundColor Red
    exit 1
}

Write-Section "Typecheck extra"
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: typecheck falhou" -ForegroundColor Red
    exit 1
}

Write-Section "Arquivos alterados"
git status --short

if ($matchesFound) {
    Write-Host ""
    Write-Host "Ainda existem sinais de demo/template. Revise o resultado do Codex antes de subir." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Validação final OK. Pode fazer commit e push." -ForegroundColor Green
}
