[CmdletBinding()]
param(
    [string]$RepoRoot = "D:\mdh-3d-store",
    [switch]$RunAfterCreate
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Ensure-Dir([string]$Path) {
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }
}

function Write-Utf8File([string]$Path, [string]$Content) {
    $parent = Split-Path $Path -Parent
    if ($parent) { Ensure-Dir $parent }
    Set-Content -Path $Path -Value $Content -Encoding UTF8
}

if (-not (Test-Path $RepoRoot)) {
    throw "RepoRoot não existe: $RepoRoot"
}

$RepoRoot = (Resolve-Path $RepoRoot).Path
Set-Location $RepoRoot

if (-not (Test-Path ".git")) {
    throw "Este diretório não é um repositório git: $RepoRoot"
}

$githubDir = Join-Path $RepoRoot ".github"
$agentsDir = Join-Path $githubDir "agents"
$instructionsDir = Join-Path $githubDir "instructions"
$scriptsDir = Join-Path $RepoRoot "scripts"
$logsDir = Join-Path $RepoRoot "squad-logs"

Ensure-Dir $githubDir
Ensure-Dir $agentsDir
Ensure-Dir $instructionsDir
Ensure-Dir $scriptsDir
Ensure-Dir $logsDir

# Preserva seu AGENTS.md principal
if (-not (Test-Path (Join-Path $RepoRoot "AGENTS.md"))) {
    @"
# MDH 3D Store

Use os agentes definidos em .github/agents e preserve Next.js App Router, checkout, conta, admin, inbox, chat, SEO e estabilidade pública.
"@ | Set-Content (Join-Path $RepoRoot "AGENTS.md") -Encoding UTF8
}

# Se existir enter.agent.md na raiz, transforma em markbot.agent.md
$enterAgentRoot = Join-Path $RepoRoot "enter.agent.md"
$markbotAgent = Join-Path $agentsDir "markbot.agent.md"
if ((Test-Path $enterAgentRoot) -and (-not (Test-Path $markbotAgent))) {
    Copy-Item $enterAgentRoot $markbotAgent -Force
}

# Instruções gerais do repositório
$copilotInstructions = @"
# Regras do repositório MDH 3D Store

- Preserve a arquitetura Next.js App Router.
- Não crie SPA paralela.
- Não crie segunda navbar, segunda loja ou segundo checkout.
- Preserve o layout atual.
- Rode lint, typecheck, testes existentes e build ao final de alterações relevantes.
- Nunca exponha tokens, segredos, CPF, PII ou credenciais.
- Se houver AGENTS.md na raiz, trate-o como instrução principal do projeto.
"@
Write-Utf8File (Join-Path $githubDir "copilot-instructions.md") $copilotInstructions

# Agentes de repositório
$auditAgent = @"
---
name: audit-bot
description: Auditor técnico implacável para bugs P0/P1, segurança, estabilidade pública e inconsistências de ecommerce.
tools: ["*"]
---

Você é o audit-bot.
- Faça auditoria objetiva do repositório.
- Liste apenas problemas reais.
- Classifique por P0/P1/P2.
- Procure 500, hydration, problemas de auth, checkout, admin, chat, mídia incorreta, secrets expostos, schema quebrado e SEO crítico.
- Não invente sucesso.
- Não implemente nesta fase, apenas audite.
"@

$devAgent = @"
---
name: dev-bot
description: Implementador full-stack sênior para Next.js App Router, TypeScript, testes, checkout, catálogo e admin.
tools: ["*"]
---

Você é o dev-bot.
- Corrija a raiz do problema.
- Preserve o que já funciona.
- Use Server Components por padrão e Client Components apenas quando necessário.
- Trate erros de API com try/catch e logs sem PII.
- Se mexer em lógica crítica, inclua ou atualize testes.
- Não invente resultados.
"@

$secAgent = @"
---
name: sec-bot
description: Especialista em AppSec para autenticação, autorização, secrets, headers e hardening.
tools: ["*"]
---

Você é o sec-bot.
- Revise mudanças buscando hardcoded secrets, IDOR, falhas de auth, inputs não sanitizados e headers de segurança faltando.
- Bloqueie aprovações se houver risco real.
- Nunca permita exposição de credenciais no frontend.
- Não invente sucesso.
"@

$opsAgent = @"
---
name: ops-bot
description: Especialista em build, deploy, logs, smoke tests, health checks e readiness operacional.
tools: ["*"]
---

Você é o ops-bot.
- Valide build, testes, health checks e readiness de deploy.
- Se env vars mudarem, exija redeploy.
- Não declare produção pronta sem evidência objetiva.
- Não invente sucesso.
"@

Write-Utf8File (Join-Path $agentsDir "audit-bot.agent.md") $auditAgent
Write-Utf8File (Join-Path $agentsDir "dev-bot.agent.md")   $devAgent
Write-Utf8File (Join-Path $agentsDir "sec-bot.agent.md")   $secAgent
Write-Utf8File (Join-Path $agentsDir "ops-bot.agent.md")   $opsAgent

# Runner principal
$runner = @'
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
'@
Write-Utf8File (Join-Path $scriptsDir "MDH-SQUAD-RUNNER.ps1") $runner

Write-Host ""
Write-Host "OK: agentes criados em .github/agents e runner criado em scripts/MDH-SQUAD-RUNNER.ps1"
Write-Host "Agora rode:"
Write-Host "  cd $RepoRoot"
Write-Host "  pwsh -File .\scripts\MDH-SQUAD-RUNNER.ps1 -Task Audit"
Write-Host "  pwsh -File .\scripts\MDH-SQUAD-RUNNER.ps1 -Task FullCycle -AutoPush"

if ($RunAfterCreate) {
    & pwsh -File (Join-Path $scriptsDir "MDH-SQUAD-RUNNER.ps1") -Task Audit
}