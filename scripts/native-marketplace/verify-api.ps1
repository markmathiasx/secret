[CmdletBinding()]
param([uri]$BaseUrl = 'http://127.0.0.1:8080')
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-JsonEndpoint {
    param([Parameter(Mandatory)][string]$Path)
    $response = Invoke-WebRequest -Uri ([uri]::new($BaseUrl, $Path)) -TimeoutSec 10 -SkipHttpErrorCheck
    if ($response.StatusCode -ne 200) { throw "$Path retornou HTTP $($response.StatusCode)" }
    try { return $response.Content | ConvertFrom-Json } catch { throw "$Path não retornou JSON válido." }
}

$health = Get-JsonEndpoint '/health'
if ($health.status -ne 'ok') { throw '/health sem status ok.' }
$capabilities = Get-JsonEndpoint '/api/capabilities'
if ($capabilities.identity -ne 'firebase' -or $capabilities.payments -ne $false) { throw 'Contrato de capabilities inesperado.' }
$categories = Get-JsonEndpoint '/api/categories'
if ($null -eq $categories.items) { throw '/api/categories sem items.' }
$products = Get-JsonEndpoint '/api/products?limit=1'
if ($null -eq $products.items -or -not ($products.PSObject.Properties.Name -contains 'nextCursor')) { throw '/api/products fora do contrato.' }
Write-Host "API verificada: health=ok categorias=$(@($categories.items).Count) amostraProdutos=$(@($products.items).Count)" -ForegroundColor Green
