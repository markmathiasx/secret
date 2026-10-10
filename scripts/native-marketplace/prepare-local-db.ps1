[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$PostgresBin = 'C:\Program Files\PostgreSQL\17\bin',
    [string]$PostgresHost = '127.0.0.1',
    [int]$PostgresPort = 5433,
    [string]$Database = 'mdh_mobile_test',
    [string]$RuntimeRole = 'mdh_app',
    [string]$PrivateDirectory = (Join-Path $env:LOCALAPPDATA 'MDH3D\private')
)
. (Join-Path $PSScriptRoot 'common.ps1')

Assert-SafePgName -Value $Database -Label 'Banco'
Assert-SafePgName -Value $RuntimeRole -Label 'Usuário runtime'
$psql = Join-Path $PostgresBin 'psql.exe'
$pgReady = Join-Path $PostgresBin 'pg_isready.exe'
$pgDump = Join-Path $PostgresBin 'pg_dump.exe'
Assert-ExternalCommand -Path $psql -Label 'psql'
Assert-ExternalCommand -Path $pgReady -Label 'pg_isready'
Assert-ExternalCommand -Path $pgDump -Label 'pg_dump'

Write-Host "Destino confirmado: host=$PostgresHost porta=$PostgresPort banco=$Database usuário=$RuntimeRole" -ForegroundColor Cyan
& $pgReady -h $PostgresHost -p $PostgresPort
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL local não está aceitando conexões.' }

New-Item -ItemType Directory -Force -Path $PrivateDirectory | Out-Null
Protect-PrivatePath -Path $PrivateDirectory
$roleExists = (& $psql -w -h $PostgresHost -p $PostgresPort -U postgres -d postgres -Atc "SELECT 1 FROM pg_roles WHERE rolname='$RuntimeRole'") -eq '1'
$databaseExists = (& $psql -w -h $PostgresHost -p $PostgresPort -U postgres -d postgres -Atc "SELECT 1 FROM pg_database WHERE datname='$Database'") -eq '1'
if ($LASTEXITCODE -ne 0) { throw 'A conexão administrativa local falhou. Revise pg_hba.conf ou forneça acesso local sem registrar senha.' }

$password = $null
if (-not $roleExists) {
    $password = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(36))
    $escapedPassword = $password.Replace("'", "''")
    "CREATE ROLE `"$RuntimeRole`" LOGIN PASSWORD '$escapedPassword' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;" |
        & $psql -w -v ON_ERROR_STOP=1 -h $PostgresHost -p $PostgresPort -U postgres -d postgres
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar o usuário runtime.' }
}

if (-not $databaseExists) {
    "CREATE DATABASE `"$Database`" OWNER `"$RuntimeRole`" ENCODING 'UTF8';" |
        & $psql -w -v ON_ERROR_STOP=1 -h $PostgresHost -p $PostgresPort -U postgres -d postgres
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar o banco local isolado.' }
} else {
    $hasSchema = (& $psql -w -h $PostgresHost -p $PostgresPort -U postgres -d $Database -Atc "SELECT 1 FROM pg_namespace WHERE nspname='mdh_marketplace'") -eq '1'
    if ($hasSchema) {
        $backupDirectory = Join-Path $PrivateDirectory 'backups'
        New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
        Protect-PrivatePath -Path $backupDirectory
        $backup = Join-Path $backupDirectory ("{0}-{1}.dump" -f $Database, (Get-Date -Format 'yyyyMMdd-HHmmss'))
        & $pgDump -w -Fc -h $PostgresHost -p $PostgresPort -U postgres -d $Database -f $backup
        if ($LASTEXITCODE -ne 0) { throw 'Backup de segurança falhou; migration cancelada.' }
        Protect-PrivatePath -Path $backup
        Write-Host "Backup criado fora do repositório: $backup"
    }
}

$configPath = Join-Path $PrivateDirectory 'marketplace-api.local.json'
if (-not (Test-Path -LiteralPath $configPath)) {
    $credential = if ($password) { "${RuntimeRole}:$([Uri]::EscapeDataString($password))@" } else { "${RuntimeRole}@" }
    [ordered]@{
        databaseUrl = "postgresql://${credential}${PostgresHost}:$PostgresPort/$Database"
        firebaseProjectId = 'mdh3d-store'
        port = 8080
        allowedOrigin = ''
    } | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding utf8NoBOM
    Protect-PrivatePath -Path $configPath
} elseif ($password) {
    throw "O usuário foi criado, mas $configPath já existia e não foi sobrescrito. Remova-o conscientemente e execute novamente para persistir a nova credencial."
}

$config = Read-PrivateApiConfig -PrivateDirectory $PrivateDirectory
$previousDatabaseUrl = $env:DATABASE_URL
try {
    $env:DATABASE_URL = [string]$config.databaseUrl
    Push-Location (Join-Path $RepositoryRoot 'services\marketplace-api')
    try {
        & npm run migrate
        if ($LASTEXITCODE -ne 0) { throw 'Migration falhou.' }
    } finally { Pop-Location }
} finally { $env:DATABASE_URL = $previousDatabaseUrl }

$tables = & $psql -w -h $PostgresHost -p $PostgresPort -U $RuntimeRole -d $Database -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema='mdh_marketplace'"
$indexes = & $psql -w -h $PostgresHost -p $PostgresPort -U $RuntimeRole -d $Database -Atc "SELECT count(*) FROM pg_indexes WHERE schemaname='mdh_marketplace'"
if ($LASTEXITCODE -ne 0) { throw 'Validação final do schema falhou.' }
Write-Host "Banco pronto: tabelas=$tables índices=$indexes runtime_superuser=false" -ForegroundColor Green
