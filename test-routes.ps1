#!/usr/bin/env pwsh
# Smoke test for storefront routes

$baseUrl = "http://localhost:3000"
$routes = @(
    "/",
    "/catalogo",
    "/checkout",
    "/conta",
    "/presentes-3d",
    "/imagem-para-impressao-3d",
    "/faq",
    "/entregas",
    "/catalogo?mode=real",
    "/catalogo?status=Pronta%20entrega",
    "/catalogo?intent=Presente"
)

Write-Host "Testing routes..." -ForegroundColor Cyan

foreach ($route in $routes) {
    try {
        $url = "$baseUrl$route"
        $response = curl -s -w "%{http_code}" -o /tmp/response.txt $url
        $statusCode = $response[-3..-1] -join ""
        
        if ($statusCode -eq "200") {
            Write-Host "✓ $route - 200 OK" -ForegroundColor Green
        } else {
            Write-Host "✗ $route - $statusCode" -ForegroundColor Red
            Get-Content /tmp/response.txt | Select-Object -First 5
        }
    } catch {
        Write-Host "✗ $route - Error: $_" -ForegroundColor Red
    }
}
