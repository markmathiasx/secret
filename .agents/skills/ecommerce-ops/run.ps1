param(
    [string]$ProjectRoot = "."
)

Write-Host "Checklist ecommerce-ops para: $ProjectRoot"
$checks = @(
    'Home com CTA claro',
    'Schema de produto/categoria',
    'Titles e metas',
    'Core Web Vitals',
    'Tracking de conversão',
    'FAQ e prova social',
    'Logs e tratamento de erro em integrações'
)
$checks | ForEach-Object { Write-Host "- $_" }
