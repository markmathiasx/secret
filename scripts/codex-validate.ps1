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
