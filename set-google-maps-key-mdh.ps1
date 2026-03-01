param(
  [string]$ProjectPath = "D:\mdh-3d-store",
  [string]$GoogleMapsApiKey = ""
)

$envFile = Join-Path $ProjectPath ".env.local"
if (-not (Test-Path $envFile)) {
  New-Item -ItemType File -Path $envFile -Force | Out-Null
}

if ([string]::IsNullOrWhiteSpace($GoogleMapsApiKey)) {
  $GoogleMapsApiKey = Read-Host "Cole a Google Maps API key"
}

$content = Get-Content $envFile -Raw
if ($content -match "(?m)^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=") {
  $content = [regex]::Replace($content, "(?m)^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*$", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$GoogleMapsApiKey")
} else {
  if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) { $content += "`r`n" }
  $content += "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$GoogleMapsApiKey`r`n"
}

Set-Content -Path $envFile -Value $content -Encoding UTF8
Write-Host ".env.local atualizado em $envFile"
