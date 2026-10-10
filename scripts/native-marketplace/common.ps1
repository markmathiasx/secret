Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-ExternalCommand {
    param([Parameter(Mandatory)][string]$Path, [Parameter(Mandatory)][string]$Label)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "$Label não encontrado em: $Path"
    }
}

function Assert-SafePgName {
    param([Parameter(Mandatory)][string]$Value, [Parameter(Mandatory)][string]$Label)
    if ($Value -notmatch '^[a-zA-Z_][a-zA-Z0-9_]{0,62}$') {
        throw "$Label inválido: use apenas letras, números e sublinhado."
    }
}

function Protect-PrivatePath {
    param([Parameter(Mandatory)][string]$Path)
    if (-not $IsWindows) { return }
    & icacls.exe $Path '/inheritance:r' '/grant:r' "${env:USERNAME}:(F)" 'SYSTEM:(F)' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Não foi possível restringir as permissões de $Path" }
}

function Read-PrivateApiConfig {
    param([Parameter(Mandatory)][string]$PrivateDirectory)
    $configPath = Join-Path $PrivateDirectory 'marketplace-api.local.json'
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        throw "Configuração ausente. Execute scripts/native-marketplace/prepare-local-db.ps1 primeiro."
    }
    return Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
}

function Get-ConnectedAndroidDevice {
    param([Parameter(Mandatory)][string]$AdbPath)
    Assert-ExternalCommand -Path $AdbPath -Label 'adb'
    $devices = & $AdbPath devices | Select-Object -Skip 1 | ForEach-Object {
        if ($_ -match '^([^\s]+)\s+device$') { $Matches[1] }
    }
    if ($LASTEXITCODE -ne 0) { throw 'adb devices falhou.' }
    $device = @($devices)[0]
    if (-not $device) { throw 'Nenhum dispositivo Android pronto foi detectado.' }
    return $device
}
