[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$FlutterPath = 'C:\Users\markkk\Downloads\flutter\bin\flutter.bat',
    [string]$AndroidSdk = 'C:\Users\markkk\AppData\Local\Android\Sdk',
    [string]$PostgresBin = 'C:\Program Files\PostgreSQL\17\bin',
    [string]$PrivateDirectory = (Join-Path $env:LOCALAPPDATA 'MDH3D\private'),
    [int]$PostgresPort = 5433
)
. (Join-Path $PSScriptRoot 'common.ps1')

$adb = Join-Path $AndroidSdk 'platform-tools\adb.exe'
$psql = Join-Path $PostgresBin 'psql.exe'
$pgReady = Join-Path $PostgresBin 'pg_isready.exe'
$checks = [ordered]@{
    Repository = Test-Path -LiteralPath (Join-Path $RepositoryRoot '.git')
    Node = [bool](Get-Command node -ErrorAction SilentlyContinue)
    Npm = [bool](Get-Command npm -ErrorAction SilentlyContinue)
    Flutter = Test-Path -LiteralPath $FlutterPath
    Adb = Test-Path -LiteralPath $adb
    Psql = Test-Path -LiteralPath $psql
    ApiPrivateConfig = Test-Path -LiteralPath (Join-Path $PrivateDirectory 'marketplace-api.local.json')
    FirebaseClientConfig = Test-Path -LiteralPath (Join-Path $PrivateDirectory 'firebase-client.json')
    FirebaseAdminCredential = Test-Path -LiteralPath (Join-Path $PrivateDirectory 'firebase-admin.json')
}
$checks.GetEnumerator() | ForEach-Object { "{0,-28} {1}" -f $_.Key, $(if ($_.Value) { 'OK' } else { 'AUSENTE' }) }

if ($checks.Psql) {
    & $pgReady -h 127.0.0.1 -p $PostgresPort
    if ($LASTEXITCODE -ne 0) { Write-Warning "PostgreSQL não respondeu em 127.0.0.1:$PostgresPort" }
}
if ($checks.Adb) { & $adb devices -l }
if ($checks.Flutter) { & $FlutterPath --version }

$clientPath = Join-Path $PrivateDirectory 'firebase-client.json'
if (Test-Path -LiteralPath $clientPath) {
    $client = Get-Content -LiteralPath $clientPath -Raw | ConvertFrom-Json
    "Firebase client projectId: $($client.projectId)"
    "Google auth solicitado: $([bool]$client.googleAuthEnabled)"
}
Write-Host 'Diagnóstico concluído sem imprimir credenciais.' -ForegroundColor Green
