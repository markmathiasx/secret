[CmdletBinding()]
param([string]$PrivateDirectory = (Join-Path $env:LOCALAPPDATA 'MDH3D\private'))
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$pidPath = Join-Path $PrivateDirectory 'marketplace-api.pid'
if (-not (Test-Path -LiteralPath $pidPath)) { Write-Host 'Nenhum PID registrado.'; exit 0 }
$processId = [int](Get-Content -LiteralPath $pidPath -Raw)
$process = Get-Process -Id $processId -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $processId
    $process.WaitForExit(10000) | Out-Null
}
Remove-Item -LiteralPath $pidPath -Force
Write-Host "API finalizada (PID $processId)." -ForegroundColor Green
