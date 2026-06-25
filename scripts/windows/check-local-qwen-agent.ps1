$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent | Split-Path -Parent)
node --experimental-strip-types local-agent/src/index.ts --once
