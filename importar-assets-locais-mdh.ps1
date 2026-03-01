param(
    [string]$ProjectPath = "D:\mdh-3d-store",
    [string]$DownloadRoot = "$env:USERPROFILE\Downloads\mdh-import",
    [switch]$PrepareOnly
)

$ErrorActionPreference = "Stop"

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-FirstFileByExt {
    param(
        [string]$Folder,
        [string[]]$Extensions
    )
    if (-not (Test-Path -LiteralPath $Folder)) { return $null }
    $extSet = $Extensions | ForEach-Object { $_.ToLowerInvariant() }
    return Get-ChildItem -LiteralPath $Folder -File | Where-Object {
        $extSet -contains $_.Extension.ToLowerInvariant()
    } | Sort-Object Name | Select-Object -First 1
}

function Copy-Or-RenameFirst {
    param(
        [string]$SourceFolder,
        [string]$TargetFolder,
        [string]$TargetBaseName,
        [string[]]$Extensions
    )
    $file = Get-FirstFileByExt -Folder $SourceFolder -Extensions $Extensions
    if ($null -eq $file) { return $null }
    Ensure-Dir $TargetFolder
    $target = Join-Path $TargetFolder ($TargetBaseName + $file.Extension.ToLowerInvariant())
    Copy-Item -LiteralPath $file.FullName -Destination $target -Force
    return $target
}

$downloadMedia = Join-Path $DownloadRoot "media"
$downloadBackgrounds = Join-Path $DownloadRoot "backgrounds"
$downloadProducts = Join-Path $DownloadRoot "products"
$projectPublic = Join-Path $ProjectPath "public"
$projectMedia = Join-Path $projectPublic "media"
$projectBackgrounds = Join-Path $projectPublic "backgrounds"
$projectProducts = Join-Path $projectPublic "products"

@($DownloadRoot, $downloadMedia, $downloadBackgrounds, $downloadProducts, $projectPublic, $projectMedia, $projectBackgrounds, $projectProducts) | ForEach-Object { Ensure-Dir $_ }

$readmePath = Join-Path $DownloadRoot "LEIA-ME-MDH-ASSETS.txt"
$readme = @"
MDH 3D - Importação de assets locais

1) Baixe os vídeos e imagens para estas pastas:
   $downloadMedia
   $downloadBackgrounds
   $downloadProducts

2) Mídia de fundo:
   - Coloque o vídeo principal da impressora em: $downloadMedia
   - Coloque um segundo vídeo de acabamento em: $downloadMedia
   - Coloque uma imagem de fallback em: $downloadBackgrounds

3) Produtos:
   - Crie uma pasta por produto dentro de: $downloadProducts
   - Exemplo:
       $downloadProducts\hello-kitty-laco\
       $downloadProducts\suporte-controle-ps5\
   - Dentro de cada pasta, coloque até 3 imagens do produto.
   - O script vai copiar e renomear automaticamente para 1, 2 e 3.

4) Execute novamente este script SEM -PrepareOnly para importar tudo ao projeto.

Arquivos finais no projeto:
   $projectMedia\hero-printer-loop.mp4/webm
   $projectMedia\finishing-closeup.mp4/webm
   $projectBackgrounds\hero-printer-fallback.jpg/webp/png
   $projectProducts\<slug>\1.jpg|png|webp
   $projectProducts\<slug>\2.jpg|png|webp
   $projectProducts\<slug>\3.jpg|png|webp
"@
Set-Content -LiteralPath $readmePath -Value $readme -Encoding UTF8

if ($PrepareOnly) {
    Write-Host "Estrutura criada com sucesso."
    Write-Host "Baixe seus arquivos para: $DownloadRoot"
    Write-Host "Leia as instruções em: $readmePath"
    exit 0
}

$summary = New-Object System.Collections.Generic.List[string]

# Vídeos principais
$videoExts = @('.mp4', '.webm', '.mov')
$imageExts = @('.jpg', '.jpeg', '.png', '.webp')

$videoFiles = Get-ChildItem -LiteralPath $downloadMedia -File -ErrorAction SilentlyContinue | Where-Object { $videoExts -contains $_.Extension.ToLowerInvariant() } | Sort-Object Name
if ($videoFiles.Count -ge 1) {
    $target1 = Join-Path $projectMedia ("hero-printer-loop" + $videoFiles[0].Extension.ToLowerInvariant())
    Copy-Item -LiteralPath $videoFiles[0].FullName -Destination $target1 -Force
    $summary.Add("Vídeo principal: $($videoFiles[0].Name) -> $(Split-Path $target1 -Leaf)")
}
if ($videoFiles.Count -ge 2) {
    $target2 = Join-Path $projectMedia ("finishing-closeup" + $videoFiles[1].Extension.ToLowerInvariant())
    Copy-Item -LiteralPath $videoFiles[1].FullName -Destination $target2 -Force
    $summary.Add("Vídeo secundário: $($videoFiles[1].Name) -> $(Split-Path $target2 -Leaf)")
}

# Fallback de fundo
$bgFile = Get-FirstFileByExt -Folder $downloadBackgrounds -Extensions $imageExts
if ($null -ne $bgFile) {
    $targetBg = Join-Path $projectBackgrounds ("hero-printer-fallback" + $bgFile.Extension.ToLowerInvariant())
    Copy-Item -LiteralPath $bgFile.FullName -Destination $targetBg -Force
    $summary.Add("Imagem fallback: $($bgFile.Name) -> $(Split-Path $targetBg -Leaf)")
}

# Produtos
$productDirs = Get-ChildItem -LiteralPath $downloadProducts -Directory -ErrorAction SilentlyContinue | Sort-Object Name
foreach ($dir in $productDirs) {
    $targetDir = Join-Path $projectProducts $dir.Name
    Ensure-Dir $targetDir
    $productFiles = Get-ChildItem -LiteralPath $dir.FullName -File | Where-Object { $imageExts -contains $_.Extension.ToLowerInvariant() } | Sort-Object Name | Select-Object -First 3
    $index = 1
    foreach ($file in $productFiles) {
        $target = Join-Path $targetDir ("$index" + $file.Extension.ToLowerInvariant())
        Copy-Item -LiteralPath $file.FullName -Destination $target -Force
        $index++
    }
    if ($productFiles.Count -gt 0) {
        $summary.Add("Produto '$($dir.Name)': $($productFiles.Count) imagem(ns) importadas")
    }
}

$summaryPath = Join-Path $DownloadRoot "RESUMO-IMPORTACAO-MDH.txt"
if ($summary.Count -eq 0) {
    $summary.Add("Nenhum arquivo encontrado para importar. Coloque arquivos nas pastas de download e execute o script novamente.")
}
Set-Content -LiteralPath $summaryPath -Value ($summary -join [Environment]::NewLine) -Encoding UTF8

Write-Host "Importação concluída."
Write-Host "Resumo: $summaryPath"
Write-Host "Projeto atualizado em: $ProjectPath"
