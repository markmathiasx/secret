$routes = @(
    "/",
    "/catalogo",
    "/catalogo?mode=real",
    "/catalogo?status=Pronta%20entrega",
    "/catalogo?intent=Presente",
    "/checkout",
    "/conta",
    "/presentes-3d",
    "/imagem-para-impressao-3d",
    "/faq",
    "/entregas"
)

Write-Host "Testing $($routes.Count) routes..." -ForegroundColor Cyan
$passed = 0
$failed = 0

foreach ($route in $routes) {
    $url = "http://localhost:3000$route"
    try {
        $response = curl -s -o /tmp/response.html -w "%{http_code}" $url 2>&1
        $statusCode = $response[-3..-1] -join ""
        if ($statusCode -eq "200") {
            Write-Host "OK $route" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "FAIL $route - $statusCode" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "FAIL $route - Error" -ForegroundColor Red
        $failed++
    }
}

Write-Host "Results: $passed passed, $failed failed" -ForegroundColor Cyan
