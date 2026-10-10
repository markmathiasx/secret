[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$PostgresBin = 'C:\Program Files\PostgreSQL\17\bin',
    [string]$PrivateDirectory = (Join-Path $env:LOCALAPPDATA 'MDH3D\private')
)
. (Join-Path $PSScriptRoot 'common.ps1')

$config = Read-PrivateApiConfig -PrivateDirectory $PrivateDirectory
$pgDump = Join-Path $PostgresBin 'pg_dump.exe'
Assert-ExternalCommand -Path $pgDump -Label 'pg_dump'
$databaseUri = [uri]$config.databaseUrl
$database = $databaseUri.AbsolutePath.TrimStart('/')
$runtimeRole = $databaseUri.UserInfo.Split(':')[0]
$backupDirectory = Join-Path $PrivateDirectory 'backups'
New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
Protect-PrivatePath -Path $backupDirectory
$backup = Join-Path $backupDirectory ("{0}-pre-import-{1}.dump" -f $database, (Get-Date -Format 'yyyyMMdd-HHmmss'))

$previousPgPassword = $env:PGPASSWORD
try {
    if ($databaseUri.UserInfo.Contains(':')) {
        $env:PGPASSWORD = [Uri]::UnescapeDataString($databaseUri.UserInfo.Substring($databaseUri.UserInfo.IndexOf(':') + 1))
    }
    & $pgDump -Fc -h $databaseUri.Host -p $databaseUri.Port -U $runtimeRole -d $database -f $backup
    if ($LASTEXITCODE -ne 0) { throw 'Backup pré-importação falhou; importação cancelada.' }
} finally {
    if ($null -eq $previousPgPassword) { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
    else { $env:PGPASSWORD = $previousPgPassword }
}
Protect-PrivatePath -Path $backup

$previousDatabaseUrl = $env:DATABASE_URL
try {
    $env:DATABASE_URL = [string]$config.databaseUrl
    Push-Location (Join-Path $RepositoryRoot 'services\marketplace-api')
    try {
        & npm run catalog:dry-run
        if ($LASTEXITCODE -ne 0) { throw 'Dry-run do catálogo falhou.' }
        & npm run catalog:import
        if ($LASTEXITCODE -ne 0) { throw 'Importação do catálogo falhou.' }
    } finally { Pop-Location }
} finally { $env:DATABASE_URL = $previousDatabaseUrl }
Write-Host "Catálogo importado após backup em $backup" -ForegroundColor Green
