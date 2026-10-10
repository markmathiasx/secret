[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path,
    [string]$PrivateDirectory = (Join-Path $env:LOCALAPPDATA 'MDH3D\private'),
    [switch]$Foreground
)
. (Join-Path $PSScriptRoot 'common.ps1')

$config = Read-PrivateApiConfig -PrivateDirectory $PrivateDirectory
$apiDirectory = Join-Path $RepositoryRoot 'services\marketplace-api'
$adminCredential = Join-Path $PrivateDirectory 'firebase-admin.json'
$pidPath = Join-Path $PrivateDirectory 'marketplace-api.pid'
$stdoutPath = Join-Path $PrivateDirectory 'marketplace-api.stdout.log'
$stderrPath = Join-Path $PrivateDirectory 'marketplace-api.stderr.log'

if (Test-Path -LiteralPath $pidPath) {
    $existingPid = [int](Get-Content -LiteralPath $pidPath -Raw)
    if (Get-Process -Id $existingPid -ErrorAction SilentlyContinue) { throw "API já está ativa no PID $existingPid" }
    Remove-Item -LiteralPath $pidPath
}

$previous = @{
    DATABASE_URL = $env:DATABASE_URL
    FIREBASE_PROJECT_ID = $env:FIREBASE_PROJECT_ID
    GOOGLE_APPLICATION_CREDENTIALS = $env:GOOGLE_APPLICATION_CREDENTIALS
    PORT = $env:PORT
    ALLOWED_ORIGIN = $env:ALLOWED_ORIGIN
}
try {
    $env:DATABASE_URL = [string]$config.databaseUrl
    $env:FIREBASE_PROJECT_ID = [string]$config.firebaseProjectId
    $env:PORT = [string]$config.port
    $env:ALLOWED_ORIGIN = [string]$config.allowedOrigin
    if (Test-Path -LiteralPath $adminCredential) { $env:GOOGLE_APPLICATION_CREDENTIALS = $adminCredential }
    else { Remove-Item Env:GOOGLE_APPLICATION_CREDENTIALS -ErrorAction SilentlyContinue }

    if ($Foreground) {
        Push-Location $apiDirectory
        try { & node src/server.js } finally { Pop-Location }
        exit $LASTEXITCODE
    }
    $process = Start-Process -FilePath (Get-Command node).Source -ArgumentList 'src/server.js' -WorkingDirectory $apiDirectory -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru
    Set-Content -LiteralPath $pidPath -Value $process.Id -Encoding ascii
    Protect-PrivatePath -Path $pidPath
    Start-Sleep -Seconds 2
    if ($process.HasExited) { throw "API encerrou na inicialização. Consulte $stderrPath" }
    Write-Host "API iniciada em http://127.0.0.1:$($config.port) (PID $($process.Id))." -ForegroundColor Green
    if (-not (Test-Path -LiteralPath $adminCredential)) {
        Write-Warning 'Credencial Firebase Admin ausente: catálogo público funciona, mas tokens reais ainda não podem ser homologados.'
    }
} finally {
    foreach ($name in $previous.Keys) {
        if ($null -eq $previous[$name]) { Remove-Item "Env:$name" -ErrorAction SilentlyContinue }
        else { Set-Item "Env:$name" $previous[$name] }
    }
}
