param(
    [string]$ProjectPath = "D:\mdh-3d-store",
    [switch]$AfterCodex
)

$ErrorActionPreference = "Stop"

function Ensure-LineInFile {
    param(
        [string]$Path,
        [string]$Line
    )
    if (-not (Test-Path $Path)) {
        New-Item -ItemType File -Path $Path -Force | Out-Null
    }
    $content = Get-Content $Path -ErrorAction SilentlyContinue
    if ($content -notcontains $Line) {
        Add-Content -Path $Path -Value $Line
    }
}

if (-not (Test-Path $ProjectPath)) {
    throw "Projeto nao encontrado em: $ProjectPath"
}

Set-Location $ProjectPath

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path (Split-Path $ProjectPath -Parent) "mdh-backups"
$backupFile = Join-Path $backupRoot "mdh-3d-store-$timestamp.zip"
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

Write-Host "==> Backup do projeto"
Compress-Archive -Path (Join-Path $ProjectPath '*') -DestinationPath $backupFile -Force
Write-Host "Backup salvo em: $backupFile"

Write-Host "==> Ajustando .gitignore"
Ensure-LineInFile -Path ".gitignore" -Line ".next"
Ensure-LineInFile -Path ".gitignore" -Line "tsconfig.tsbuildinfo"
Ensure-LineInFile -Path ".gitignore" -Line "*.log"

Write-Host "==> Limpando caches locais"
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "tsconfig.tsbuildinfo") { Remove-Item -Force "tsconfig.tsbuildinfo" }

Write-Host "==> Criando pastas de assets locais"
New-Item -ItemType Directory -Force -Path "public\media" | Out-Null
New-Item -ItemType Directory -Force -Path "public\backgrounds" | Out-Null
New-Item -ItemType Directory -Force -Path "public\products" | Out-Null
New-Item -ItemType Directory -Force -Path "public\products\anime" | Out-Null
New-Item -ItemType Directory -Force -Path "public\products\geek" | Out-Null
New-Item -ItemType Directory -Force -Path "public\products\utilitarios" | Out-Null
New-Item -ItemType Directory -Force -Path "public\products\personalizados" | Out-Null

$branchName = "codex/total-redesign-2026-$timestamp"
try {
    git rev-parse --is-inside-work-tree *> $null
    Write-Host "==> Git detectado"
    git checkout -b $branchName 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Branch criada: $branchName"
    }
    else {
        Write-Host "Branch nao criada. Pode ser que voce ja esteja em uma branch de trabalho."
    }
} catch {
    Write-Host "Git nao disponivel ou repo nao inicializado. Seguindo sem branch."
}

Write-Host "==> Instalando dependencias atuais"
npm.cmd install

if (-not $AfterCodex) {
    Write-Host ""
    Write-Host "PRONTO. Agora faca isto:"
    Write-Host "1) Cole o prompt do Codex"
    Write-Host "2) Espere o Codex aplicar tudo"
    Write-Host "3) Rode este mesmo script novamente com -AfterCodex"
    Write-Host ""
    Write-Host "Exemplo:"
    Write-Host "& '$PSCommandPath' -ProjectPath '$ProjectPath' -AfterCodex"
    exit 0
}

Write-Host "==> Testando build apos alteracoes do Codex"
npm.cmd run build

Write-Host "==> Estado do git"
git status

Write-Host ""
Write-Host "Se o build passou, finalize com:"
Write-Host "git add ."
Write-Host "git commit -m 'feat: full professional redesign and production hardening'"
Write-Host "git push origin HEAD"
