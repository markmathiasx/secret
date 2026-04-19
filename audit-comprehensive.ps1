#!/usr/bin/env pwsh

# Comprehensive audit script for MDH 3D Storefront
# Tests local and production environments

param(
    [ValidateSet('local', 'production', 'both')]
    [string]$Environment = 'both'
)

$baseUrlLocal = 'http://localhost:3000'
$baseUrlProduction = $env:NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
$reportsDir = 'D:\mdh-3d-store\reports'

if (!(Test-Path $reportsDir)) { mkdir $reportsDir | Out-Null }

$criticalRoutes = @(
    '/',
    '/catalogo',
    '/checkout',
    '/conta',
    '/presentes-3d',
    '/imagem-para-impressao-3d',
    '/faq',
    '/entregas'
)

$landingPages = @(
    '/brindes-personalizados-3d',
    '/colecionaveis-geek-3d',
    '/decoracao-3d-para-casa',
    '/setup-e-organizacao-3d'
)

$otherPages = @(
    '/login',
    '/recuperar-senha',
    '/politica-de-privacidade',
    '/trocas-e-devolucoes'
)

function Test-Route {
    param(
        [string]$Url,
        [string]$BaseUrl
    )
    
    $fullUrl = "$BaseUrl$Url"
    
    try {
        $response = curl -s -o /dev/null -w "%{http_code}" $fullUrl -m 15
        $isOk = $response -eq '200'
        
        return @{
            route = $Url
            url = $fullUrl
            statusCode = $response
            ok = $isOk
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        }
    }
    catch {
        return @{
            route = $Url
            url = $fullUrl
            statusCode = 'ERROR'
            ok = $false
            error = $_.Exception.Message
            timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        }
    }
}

function Test-Environment {
    param(
        [string]$BaseUrl,
        [string]$EnvName
    )
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Testing $EnvName Environment: $BaseUrl" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    $results = @()
    
    # Test critical routes
    Write-Host "`nCritical Routes:" -ForegroundColor Yellow
    foreach ($route in $criticalRoutes) {
        $result = Test-Route -Url $route -BaseUrl $BaseUrl
        $results += $result
        $status = if ($result.ok) { "✅ OK" } else { "❌ FAIL ($($result.statusCode))" }
        Write-Host "  $($result.route) -> $status"
    }
    
    # Test landing pages
    Write-Host "`nLanding Pages:" -ForegroundColor Yellow
    foreach ($route in $landingPages) {
        $result = Test-Route -Url $route -BaseUrl $BaseUrl
        $results += $result
        $status = if ($result.ok) { "✅ OK" } else { "❌ FAIL ($($result.statusCode))" }
        Write-Host "  $($result.route) -> $status"
    }
    
    # Test other pages
    Write-Host "`nOther Pages:" -ForegroundColor Yellow
    foreach ($route in $otherPages) {
        $result = Test-Route -Url $route -BaseUrl $BaseUrl
        $results += $result
        $status = if ($result.ok) { "✅ OK" } else { "❌ FAIL ($($result.statusCode))" }
        Write-Host "  $($result.route) -> $status"
    }
    
    # Test some PDPs (first 10)
    Write-Host "`nSample PDPs (first 10):" -ForegroundColor Yellow
    $pdpSlugs = @(
        'real-001-grinder-3-partes-premium',
        'real-002-porta-creme-dental-de-bancada',
        'real-003-demogorgon-decorativo-premium',
        'real-004-pote-decorativo-ondulado',
        'real-005-base-fone-premium',
        'real-006-botao-grande-customizavel',
        'real-007-dado-multifacetado-gamer',
        'real-008-mancala-3d-completo',
        'real-009-miniaturas-geek-sortidas',
        'real-010-suporte-articulado-fone'
    )
    
    foreach ($slug in $pdpSlugs) {
        $result = Test-Route -Url "/catalogo/$slug" -BaseUrl $BaseUrl
        $results += $result
        $status = if ($result.ok) { "✅ OK" } else { "❌ FAIL ($($result.statusCode))" }
        Write-Host "  /catalogo/$slug -> $status"
    }
    
    # Test APIs
    Write-Host "`nAPIs:" -ForegroundColor Yellow
    $apis = @(
        '/api/health',
        '/api/catalog',
        '/api/catalog/health',
        '/api/catalog/search',
        '/api/catalog/recommendations'
    )
    
    foreach ($api in $apis) {
        $result = Test-Route -Url $api -BaseUrl $BaseUrl
        $results += $result
        $status = if ($result.ok) { "✅ OK" } else { "❌ FAIL ($($result.statusCode))" }
        Write-Host "  $api -> $status"
    }
    
    # Summary
    $totalTests = $results.Count
    $passedTests = ($results | Where-Object { $_.ok }).Count
    $failedTests = $totalTests - $passedTests
    $passPercentage = if ($totalTests -gt 0) { [Math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "Summary for ${EnvName}:" -ForegroundColor Green
    Write-Host "  Total: $totalTests | Passed: $passedTests | Failed: $failedTests"
    Write-Host "  Pass Rate: $passPercentage%"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
    return @{
        environment = $EnvName
        totalTests = $totalTests
        passedTests = $passedTests
        failedTests = $failedTests
        passPercentage = $passPercentage
        timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        tests = $results
    }
}

# Run tests
$allResults = @()

if ($Environment -eq 'local' -or $Environment -eq 'both') {
    $localResults = Test-Environment -BaseUrl $baseUrlLocal -EnvName 'Local'
    $allResults += $localResults
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    $prodResults = Test-Environment -BaseUrl $baseUrlProduction -EnvName 'Production'
    $allResults += $prodResults
}

# Save results
$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$reportPath = "$reportsDir\audit-comprehensive-$timestamp.json"
$allResults | ConvertTo-Json -Depth 3 | Out-File -Path $reportPath -Force

Write-Host "`n✅ Audit report saved: $reportPath" -ForegroundColor Green
