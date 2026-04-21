[CmdletBinding()]
param(
    [string]$RepoRoot = "D:\mdh-3d-store",
    [ValidateSet("Audit","FullCycle")]
    [string]$Task = "FullCycle",
    [switch]$AutoPush,
    [int]$MaxAutopilotContinues = 8,
    [string]$Model = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Ensure-Dir([string]$Path) {
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function Write-Log {
    param([string]$Message,[string]$Level="INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    Write-Host $line
    Add-Content -Path (Join-Path $script:LogDir "runner.log") -Value $line
}

function Get-CommandPath([string]$Name) {
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

function Test-NpmScriptExists([string]$ScriptName) {
    $pkgPath = Join-Path $script:RepoRoot "package.json"
    if (-not (Test-Path $pkgPath)) { return $false }
    $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
    return ($pkg.scripts.PSObject.Properties.Name -contains $ScriptName)
}

function Invoke-NpmScript([string]$ScriptName,[switch]$Optional) {
    if (-not (Test-NpmScriptExists $ScriptName)) {
        if ($Optional) {
            Write-Log "Script ausente, pulando: npm run $ScriptName" "WARN"
            return
        }
        throw "Script npm obrigatório ausente: $ScriptName"
    }

    $log = Join-Path $script:LogDir ("npm-" + $ScriptName.Replace(":","_") + ".log")
    Push-Location $script:RepoRoot
    try {
        & $script:NpmExe run $ScriptName 2>&1 | Tee-Object -FilePath $log
        if ($LASTEXITCODE -ne 0) {
            throw "Falha em npm run $ScriptName. Veja $log"
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-CopilotAgent([string]$Agent,[string]$Prompt,[string]$OutputFile) {
    $args = @()
    if ($script:Model) {
        $args += "--model"
        $args += $script:Model
    }
    $args += "--agent=$Agent"
    $args += "--autopilot"
    $args += "--yolo"
    $args += "--max-autopilot-continues"
    $args += $script:MaxAutopilotContinues.ToString()
    $args += "--prompt"
    $args += $Prompt

    Push-Location $script:RepoRoot
    try {
        & $script:CopilotExe @args 2>&1 | Tee-Object -FilePath $OutputFile
        if ($LASTEXITCODE -ne 0) {
            throw "Copilot agent '$Agent' falhou. Veja $OutputFile"
        }
    }
    finally {
        Pop-Location
    }
}

function Git-HasChanges {
    Push-Location $script:RepoRoot
    try {
        $status = & $script:GitExe status --porcelain
        return [bool]($status -and $status.Count -gt 0)
    }
    finally {
        Pop-Location
    }
}

function Git-Commit([string]$Message) {
    Push-Location $script:RepoRoot
    try {
        & $script:GitExe add -A
        & $script:GitExe commit -m $Message 2>&1 | Tee-Object -FilePath (Join-Path $script:LogDir "git-commit.log")
        return ($LASTEXITCODE -eq 0)
    }
    finally {
        Pop-Location
    }
}

function Git-Push {
    Push-Location $script:RepoRoot
    try {
        $branch = (& $script:GitExe rev-parse --abbrev-ref HEAD).Trim()
        & $script:GitExe push origin $branch 2>&1 | Tee-Object -FilePath (Join-Path $script:LogDir "git-push.log")
        if ($LASTEXITCODE -ne 0) {
            throw "Push falhou. Veja $(Join-Path $script:LogDir "git-push.log")"
        }
    }
    finally {
        Pop-Location
    }
}

$script:RepoRoot = (Resolve-Path $RepoRoot).Path
$script:LogDir = Join-Path $script:RepoRoot "squad-logs"
$script:MaxAutopilotContinues = $MaxAutopilotContinues
$script:Model = $Model

Ensure-Dir $script:LogDir
Set-Location $script:RepoRoot

if (-not (Test-Path ".git")) {
    throw "Este diretório não é um repositório git: $script:RepoRoot"
}

$script:CopilotExe = Get-CommandPath "copilot"
$script:GitExe = Get-CommandPath "git"
$script:NpmExe = Get-CommandPath "npm.cmd"
if (-not $script:NpmExe) { $script:NpmExe = Get-CommandPath "npm" }

if (-not $script:CopilotExe) { throw "copilot não encontrado" }
if (-not $script:GitExe) { throw "git não encontrado" }
if (-not $script:NpmExe) { throw "npm não encontrado" }

$auditPrompt = @"
Atue como audit-bot neste repositório MDH 3D Store.
- Leia AGENTS.md e instruções do repositório.
- Audite estabilidade pública, segurança, checkout, conta, admin, inbox, chat, WhatsApp, SEO, performance e catálogo.
- Classifique tudo em P0, P1 e P2.
- Salve a análise em squad-logs/audit-report.md.
- Não implemente nada nesta rodada.
- Não invente sucesso.
"@

$devPrompt = @"
Atue como dev-bot neste repositório MDH 3D Store.
Com base no estado atual do código e, se existir, em squad-logs/audit-report.md:
- corrija os P0/P1 reais
- preserve Next.js App Router e o layout atual
- não crie SPA paralela
- não quebre checkout, conta, admin, inbox, chat e SEO
- atualize testes quando necessário
- não invente resultados
"@

$secPrompt = @"
Atue como sec-bot neste repositório MDH 3D Store.
Revise o estado atual e as alterações recentes.
Cheque:
- secrets hardcoded
- auth e autorização
- IDOR
- headers
- inputs
- logs com PII
- segurança de checkout, conta, inbox e webhooks
Reporte riscos reais e, se houver algo crítico, diga explicitamente.
"@

$opsPrompt = @"
Atue como ops-bot neste repositório MDH 3D Store.
Valide readiness operacional:
- build
- testes
- health checks
- dependência de env vars
- necessidade de redeploy
- riscos para produção
Se houver bloqueio externo, documente exatamente.
"@

if ($Task -eq "Audit") {
    Invoke-CopilotAgent -Agent "audit-bot" -Prompt $auditPrompt -OutputFile (Join-Path $script:LogDir "audit-agent.log")
    exit 0
}

Invoke-CopilotAgent -Agent "audit-bot" -Prompt $auditPrompt -OutputFile (Join-Path $script:LogDir "audit-agent.log")
Invoke-CopilotAgent -Agent "dev-bot"   -Prompt $devPrompt   -OutputFile (Join-Path $script:LogDir "dev-agent.log")
Invoke-CopilotAgent -Agent "sec-bot"   -Prompt $secPrompt   -OutputFile (Join-Path $script:LogDir "sec-agent.log")

if (Test-NpmScriptExists "lint:check") {
    Invoke-NpmScript "lint:check"
} elseif (Test-NpmScriptExists "lint") {
    Invoke-NpmScript "lint"
}

if (Test-NpmScriptExists "typecheck") { Invoke-NpmScript "typecheck" }
if (Test-NpmScriptExists "test") {
    Invoke-NpmScript "test"
} elseif (Test-NpmScriptExists "test:smoke") {
    Invoke-NpmScript "test:smoke"
}
if (Test-NpmScriptExists "build") { Invoke-NpmScript "build" } else { throw "Script build ausente" }

Invoke-CopilotAgent -Agent "ops-bot" -Prompt $opsPrompt -OutputFile (Join-Path $script:LogDir "ops-agent.log")

if (Git-HasChanges) {
    $committed = Git-Commit "chore: autonomous squad pass (audit+dev+sec+ops)"
    if ($AutoPush -and $committed) {
        Git-Push
    }
}
