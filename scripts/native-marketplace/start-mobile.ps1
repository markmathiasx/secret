[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$FlutterPath = 'C:\Users\markkk\Downloads\flutter\bin\flutter.bat',
    [string]$AndroidSdk = 'C:\Users\markkk\AppData\Local\Android\Sdk',
    [string]$PrivateDirectory = (Join-Path $env:LOCALAPPDATA 'MDH3D\private'),
    [string]$ApiBaseUrl = 'http://10.0.2.2:8080',
    [switch]$NoResident
)
. (Join-Path $PSScriptRoot 'common.ps1')
Assert-ExternalCommand -Path $FlutterPath -Label 'Flutter'
$device = Get-ConnectedAndroidDevice -AdbPath (Join-Path $AndroidSdk 'platform-tools\adb.exe')
$arguments = @('run', '-d', $device, "--dart-define=API_BASE_URL=$ApiBaseUrl")
if ($NoResident) { $arguments += '--no-resident' }
$clientPath = Join-Path $PrivateDirectory 'firebase-client.json'
if (Test-Path -LiteralPath $clientPath) {
    $client = Get-Content -LiteralPath $clientPath -Raw | ConvertFrom-Json
    if ($client.projectId -ne 'mdh3d-store') { throw 'firebase-client.json aponta para projeto diferente de mdh3d-store.' }
    foreach ($entry in @{
        FIREBASE_API_KEY = $client.apiKey
        FIREBASE_APP_ID = $client.appId
        FIREBASE_PROJECT_ID = $client.projectId
        FIREBASE_SENDER_ID = $client.messagingSenderId
    }.GetEnumerator()) {
        if ([string]::IsNullOrWhiteSpace([string]$entry.Value)) { throw "Configuração Firebase pública ausente: $($entry.Key)" }
        $arguments += "--dart-define=$($entry.Key)=$($entry.Value)"
    }
    $googleEnabled = ([bool]$client.googleAuthEnabled).ToString().ToLowerInvariant()
    $arguments += "--dart-define=ENABLE_GOOGLE_AUTH=$googleEnabled"
} else {
    Write-Warning 'firebase-client.json ausente: catálogo inicia, autenticação permanece indisponível.'
}
Push-Location (Join-Path $RepositoryRoot 'apps\mdh_mobile')
try {
    & $FlutterPath @arguments
    if ($LASTEXITCODE -ne 0) { throw "flutter run falhou com código $LASTEXITCODE" }
} finally { Pop-Location }
