param(
    [string]$ProjectPath = "D:\mdh-3d-store"
)

$ErrorActionPreference = "Stop"

$downloads = Join-Path $env:USERPROFILE "Downloads"

$files = @{
    HeroBackground = Join-Path $downloads "istockphoto-2248672523-1024x1024.jpg"
    SecondaryBackground = Join-Path $downloads "istockphoto-2226605792-1024x1024.jpg"
    HeroVideo = Join-Path $downloads "5680034-hd_1920_1080_24fps.mp4"
    ProcessVideo = Join-Path $downloads "4198845-hd_1920_1080_25fps.mp4"
}

$publicPath = Join-Path $ProjectPath "public"
$mediaPath = Join-Path $publicPath "media"
$backgroundsPath = Join-Path $publicPath "backgrounds"

foreach ($path in @($ProjectPath, $publicPath, $mediaPath, $backgroundsPath)) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

foreach ($entry in $files.GetEnumerator()) {
    if (-not (Test-Path $entry.Value)) {
        throw "Arquivo não encontrado: $($entry.Value)"
    }
}

$heroVideoDest = Join-Path $mediaPath "hero-printer-loop.mp4"
$processVideoDest = Join-Path $mediaPath "finishing-closeup.mp4"
$heroBgDest = Join-Path $backgroundsPath "hero-printer-fallback.jpg"
$secondaryBgDest = Join-Path $backgroundsPath "process-detail.jpg"

Copy-Item $files.HeroVideo $heroVideoDest -Force
Copy-Item $files.ProcessVideo $processVideoDest -Force
Copy-Item $files.HeroBackground $heroBgDest -Force
Copy-Item $files.SecondaryBackground $secondaryBgDest -Force

Write-Host ""
Write-Host "Assets importados com sucesso:" -ForegroundColor Green
Write-Host "- $heroVideoDest"
Write-Host "- $processVideoDest"
Write-Host "- $heroBgDest"
Write-Host "- $secondaryBgDest"
Write-Host ""
Write-Host "Agora rode no projeto:" -ForegroundColor Cyan
Write-Host "cd $ProjectPath"
Write-Host "npm.cmd run build"
Write-Host "npm.cmd run dev"
Write-Host ""
Write-Host "Se o Codex já ajustou o código para mídia local, depois faça:" -ForegroundColor Cyan
Write-Host "git add ."
Write-Host 'git commit -m "feat: add local media assets"'
Write-Host "git push origin main"
