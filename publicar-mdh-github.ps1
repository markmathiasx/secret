param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,

    [string]$ProjectPath = ".",
    [string]$Branch = "main",
    [string]$CommitMessage = "MDH: preparar projeto para ajuste e deploy"
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Ensure-GitIgnore {
    $gitignorePath = Join-Path $ProjectPath ".gitignore"

    if (-not (Test-Path $gitignorePath)) {
        Write-Step "Criando .gitignore básico para Next.js/Node"
        @"
# dependencies
node_modules/

# next
.next/
out/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# build
dist/
build/
coverage/

# env
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# misc
.DS_Store
Thumbs.db
.vscode/
.idea/
*.zip
*.7z
"@ | Set-Content -Path $gitignorePath -Encoding UTF8
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git não encontrado. Instale o Git e rode novamente."
}

$fullPath = Resolve-Path $ProjectPath
Set-Location $fullPath

Write-Step "Projeto: $fullPath"
Ensure-GitIgnore

if (-not (Test-Path ".git")) {
    Write-Step "Inicializando repositório Git"
    git init
}

Write-Step "Configurando branch principal"
try {
    git checkout -B $Branch | Out-Null
} catch {
    git branch -M $Branch
}

Write-Step "Adicionando arquivos"
git add .

$hasChanges = $true
try {
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) { $hasChanges = $false }
} catch {
    $hasChanges = $true
}

if ($hasChanges) {
    Write-Step "Criando commit"
    git commit -m $CommitMessage
} else {
    Write-Step "Nenhuma alteração nova para commit"
}

$remoteExists = $false
try {
    $originUrl = git remote get-url origin 2>$null
    if ($originUrl) { $remoteExists = $true }
} catch {
    $remoteExists = $false
}

if ($remoteExists) {
    Write-Step "Atualizando remote origin"
    git remote set-url origin $RepoUrl
} else {
    Write-Step "Adicionando remote origin"
    git remote add origin $RepoUrl
}

Write-Step "Enviando para o GitHub"
git push -u origin $Branch

Write-Host "`nPronto. Repositório enviado para: $RepoUrl" -ForegroundColor Green
Write-Host "Se o push falhar por autenticação, gere um token do GitHub ou use o GitHub Desktop." -ForegroundColor Yellow
Write-Host "Depois, cole o prompt do Codex no repositório e peça para corrigir Google/CEP/Pix/URLs locais." -ForegroundColor Yellow
