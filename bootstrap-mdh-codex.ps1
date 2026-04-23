#Requires -Version 7.0
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter()]
    [string]$ProjectRoot = 'D:\mdh-3d-store',

    [Parameter()]
    [string]$ManifestPath,

    [Parameter()]
    [switch]$InitCodex,

    [Parameter()]
    [switch]$InitSkills,

    [Parameter()]
    [switch]$InitHelpers,

    [Parameter()]
    [switch]$Force,

    [Parameter()]
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('INFO','WARN','ERROR','OK')]
        [string]$Level = 'INFO'
    )

    $prefix = "[$Level]"
    switch ($Level) {
        'INFO'  { Write-Host "$prefix $Message" -ForegroundColor Cyan }
        'WARN'  { Write-Host "$prefix $Message" -ForegroundColor Yellow }
        'ERROR' { Write-Host "$prefix $Message" -ForegroundColor Red }
        'OK'    { Write-Host "$prefix $Message" -ForegroundColor Green }
    }
}

function Normalize-PathString {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) { return $null }
    $trimmed = $Value.Trim().Trim('"').Trim("'")
    if ([string]::IsNullOrWhiteSpace($trimmed)) { return $null }
    return $trimmed
}

function Ensure-Directory {
    param([Parameter(Mandatory)][string]$Path)

    if (Test-Path -LiteralPath $Path -PathType Container) {
        return $false
    }

    if ($DryRun) {
        Write-Log "[dry-run] Criaria diretório: $Path"
        return $true
    }

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    Write-Log "Diretório pronto: $Path" 'OK'
    return $true
}

function Write-FileIfMissing {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Content
    )

    $parent = Split-Path -Parent $Path
    if ($parent) { Ensure-Directory -Path $parent | Out-Null }

    $exists = Test-Path -LiteralPath $Path -PathType Leaf
    if ($exists -and -not $Force) {
        Write-Log "Pulando arquivo existente: $Path" 'WARN'
        return $false
    }

    if ($DryRun) {
        Write-Log "[dry-run] Escreveria arquivo: $Path"
        return $true
    }

    Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
    Write-Log "Arquivo pronto: $Path" 'OK'
    return $true
}

function Test-LooksLikeFile {
    param([string]$Path)

    $leaf = Split-Path -Path $Path -Leaf
    if ($leaf -match '^\.[A-Za-z0-9_-]+') { return $true }
    if ([IO.Path]::HasExtension($leaf)) { return $true }
    return $false
}

function Get-RelativeChildPath {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$FullPath
    )

    $rootNormalized = [IO.Path]::GetFullPath($Root)
    $fullNormalized = [IO.Path]::GetFullPath($FullPath)

    if ($fullNormalized.StartsWith($rootNormalized, [System.StringComparison]::OrdinalIgnoreCase)) {
        $relative = $fullNormalized.Substring($rootNormalized.Length).TrimStart('\\','/')
        return $relative
    }

    return $null
}

function Get-ManifestEntries {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Root
    )

    $rawLines = Get-Content -LiteralPath $Path -Encoding UTF8
    $results = New-Object System.Collections.Generic.List[object]

    foreach ($line in $rawLines) {
        $entry = Normalize-PathString -Value $line
        if (-not $entry) { continue }

        $relative = Get-RelativeChildPath -Root $Root -FullPath $entry
        if (-not $relative) { continue }

        $isFile = Test-LooksLikeFile -Path $entry
        $results.Add([pscustomobject]@{
            RawPath   = $entry
            Relative  = $relative
            IsFile    = $isFile
            IsDir     = -not $isFile
        })
    }

    return $results
}

function Get-AgentsMdTemplate {
@'
# AGENTS.md

## Mission
Este repositório deve priorizar resultado real, simplicidade, segurança, performance e manutenção.

## Working rules
- Sempre entender objetivo técnico e objetivo de negócio.
- Antes de mudanças grandes, propor plano curto.
- Preferir mudanças pequenas, testáveis e reversíveis.
- Não quebrar compatibilidade sem explicar.
- Não adicionar dependências pesadas sem justificativa.
- Não expor secrets.

## Coding rules
- Código limpo, modular e pronto para produção.
- Tratamento explícito de erro.
- Logs úteis sem vazar dados sensíveis.
- Tipagem quando possível.
- Validar entradas e falhas externas.

## Web / Ecommerce
- Priorizar conversão, SEO técnico, performance mobile e tracking.
- Cada página comercial precisa de proposta de valor, CTA, prova e FAQ.
- Evitar conteúdo duplicado e páginas thin.

## Bots / automações
- Preferir APIs oficiais.
- Não automatizar spam, follow/unfollow, DM em massa ou scraping abusivo.
- Toda automação deve ter logs, retries, timeouts e observabilidade.

## Validation
Antes de concluir:
- rodar lint
- rodar testes relevantes
- validar build
- revisar edge cases
- revisar segurança básica
- descrever como validar manualmente
'@
}

function Get-CodexConfigTemplate {
@'
model = "gpt-5.4"
approval_policy = "on-request"
sandbox_mode = "workspace-write"

[features]
codex_hooks = false

[projects]
trusted = true
'@
}

function Get-WebWorkerToml {
@'
name = "worker-web"
description = "Implementa landing pages, SEO técnico, tracking e melhorias de conversão."
developer_instructions = "Priorize páginas de venda, Core Web Vitals, schema, CTA, tracking, acessibilidade e responsividade. Faça mudanças pequenas, testáveis e seguras."
'@
}

function Get-SeoWorkerToml {
@'
name = "worker-seo"
description = "Audita e implementa SEO técnico, schema e arquitetura de páginas comerciais."
developer_instructions = "Revise titles, metas, headings, canonical, robots, sitemap, schema, links internos, conteúdo duplicado e intenção comercial. Evite spam programático."
'@
}

function Get-BotsWorkerToml {
@'
name = "worker-bots"
description = "Cria automações, integrações e bots seguros para operação web."
developer_instructions = "Priorize APIs oficiais, logs, retries, idempotência, monitoramento e segurança. Nunca implemente spam, evasão de plataforma ou automação abusiva."
'@
}

function Get-ReviewWorkerToml {
@'
name = "worker-review"
description = "Revisor técnico de bugs, riscos, testes e impactos laterais."
developer_instructions = "Faça revisão crítica. Procure bugs, regressões, edge cases, problemas de segurança, performance e DX. Responda com riscos, validação e próximos passos."
'@
}

function Get-SkillManifest {
@'
---
name: ecommerce-ops
summary: Checklist para operar site, SEO, conteúdo e automações com foco em venda.
---

# Ecommerce Ops

## Sempre revisar
- proposta de valor
- CTA
- prova social
- schema
- tracking
- responsividade
- performance mobile
- FAQ
- política de entrega/troca
- segurança básica
'@
}

function Get-SkillScript {
@'
param(
    [string]$ProjectRoot = "."
)

Write-Host "Checklist ecommerce-ops para: $ProjectRoot"
$checks = @(
    'Home com CTA claro',
    'Schema de produto/categoria',
    'Titles e metas',
    'Core Web Vitals',
    'Tracking de conversão',
    'FAQ e prova social',
    'Logs e tratamento de erro em integrações'
)
$checks | ForEach-Object { Write-Host "- $_" }
'@
}

function Get-HelperScript {
@'
#Requires -Version 7.0
[CmdletBinding()]
param(
    [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "Projeto: $ProjectRoot" -ForegroundColor Cyan
Push-Location $ProjectRoot
try {
    if (Test-Path .\package.json) {
        Write-Host 'Executando npm run lint...' -ForegroundColor Yellow
        npm run lint
    }
    if (Test-Path .\playwright.config.ts) {
        Write-Host 'Playwright configurado.' -ForegroundColor Green
    }
    if (Test-Path .\AGENTS.md) {
        Write-Host 'AGENTS.md encontrado.' -ForegroundColor Green
    }
    if (Test-Path .\.codex\config.toml) {
        Write-Host '.codex/config.toml encontrado.' -ForegroundColor Green
    }
}
finally {
    Pop-Location
}
'@
}

$createdDirs = New-Object System.Collections.Generic.List[string]
$createdFiles = New-Object System.Collections.Generic.List[string]

Write-Log "Bootstrap PowerShell 7 para: $ProjectRoot"
Ensure-Directory -Path $ProjectRoot | Out-Null

if ($ManifestPath) {
    if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
        throw "Manifesto não encontrado: $ManifestPath"
    }

    $entries = Get-ManifestEntries -Path $ManifestPath -Root $ProjectRoot
    foreach ($entry in $entries) {
        $target = Join-Path $ProjectRoot $entry.Relative
        if ($entry.IsDir) {
            if (Ensure-Directory -Path $target) { $createdDirs.Add($target) | Out-Null }
            continue
        }

        $parent = Split-Path -Parent $target
        if ($parent -and (Ensure-Directory -Path $parent)) { $createdDirs.Add($parent) | Out-Null }
    }

    Write-Log "Manifesto processado: $($entries.Count) entradas" 'OK'
}

$baseDirs = @(
    '.codex',
    '.codex\agents',
    '.agents',
    '.agents\skills',
    '.agents\skills\ecommerce-ops',
    'prompts_txt',
    'checklists',
    'reports',
    'logs',
    'scripts'
)

foreach ($dir in $baseDirs) {
    $target = Join-Path $ProjectRoot $dir
    if (Ensure-Directory -Path $target) { $createdDirs.Add($target) | Out-Null }
}

if ($InitCodex) {
    $codexFiles = @(
        @{ Path = (Join-Path $ProjectRoot 'AGENTS.md'); Content = (Get-AgentsMdTemplate) },
        @{ Path = (Join-Path $ProjectRoot '.codex\config.toml'); Content = (Get-CodexConfigTemplate) },
        @{ Path = (Join-Path $ProjectRoot '.codex\agents\worker-web.toml'); Content = (Get-WebWorkerToml) },
        @{ Path = (Join-Path $ProjectRoot '.codex\agents\worker-seo.toml'); Content = (Get-SeoWorkerToml) },
        @{ Path = (Join-Path $ProjectRoot '.codex\agents\worker-bots.toml'); Content = (Get-BotsWorkerToml) },
        @{ Path = (Join-Path $ProjectRoot '.codex\agents\worker-review.toml'); Content = (Get-ReviewWorkerToml) },
        @{ Path = (Join-Path $ProjectRoot 'prompts_txt\master-codex.txt'); Content = "Prompt mestre do Codex. Ajuste conforme o projeto.`n" }
    )

    foreach ($file in $codexFiles) {
        if (Write-FileIfMissing -Path $file.Path -Content $file.Content) { $createdFiles.Add($file.Path) | Out-Null }
    }
}

if ($InitSkills) {
    $skillFiles = @(
        @{ Path = (Join-Path $ProjectRoot '.agents\skills\ecommerce-ops\SKILL.md'); Content = (Get-SkillManifest) },
        @{ Path = (Join-Path $ProjectRoot '.agents\skills\ecommerce-ops\run.ps1'); Content = (Get-SkillScript) }
    )

    foreach ($file in $skillFiles) {
        if (Write-FileIfMissing -Path $file.Path -Content $file.Content) { $createdFiles.Add($file.Path) | Out-Null }
    }
}

if ($InitHelpers) {
    $helperFiles = @(
        @{ Path = (Join-Path $ProjectRoot 'scripts\codex-validate.ps1'); Content = (Get-HelperScript) },
        @{ Path = (Join-Path $ProjectRoot 'checklists\codex-bootstrap-checklist.md'); Content = "# Checklist`n`n- Validar AGENTS.md`n- Validar .codex/config.toml`n- Validar agentes customizados`n- Validar skills`n- Validar lint/build/testes`n" }
    )

    foreach ($file in $helperFiles) {
        if (Write-FileIfMissing -Path $file.Path -Content $file.Content) { $createdFiles.Add($file.Path) | Out-Null }
    }
}

$report = [pscustomobject]@{
    ProjectRoot    = $ProjectRoot
    ManifestPath   = $ManifestPath
    DryRun         = [bool]$DryRun
    InitCodex      = [bool]$InitCodex
    InitSkills     = [bool]$InitSkills
    InitHelpers    = [bool]$InitHelpers
    Force          = [bool]$Force
    CreatedDirs    = $createdDirs
    CreatedFiles   = $createdFiles
    TimestampUtc   = (Get-Date).ToUniversalTime().ToString('o')
}

$reportPath = Join-Path $ProjectRoot 'reports\codex-bootstrap-report.json'
if (-not $DryRun) {
    Ensure-Directory -Path (Split-Path -Parent $reportPath) | Out-Null
    $report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reportPath -Encoding UTF8
    Write-Log "Relatório salvo em: $reportPath" 'OK'
}

$report | ConvertTo-Json -Depth 6
