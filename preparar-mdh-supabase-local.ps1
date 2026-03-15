Set-Location D:\mdh-3d-store

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

$envFile = Join-Path (Get-Location) '.env.local'

@"
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase project already identified from your dashboard URL
NEXT_PUBLIC_SUPABASE_URL=https://jimhpbvmvhgkfrtprvfs.supabase.co

# Fill these from Supabase > Project Settings > API Keys
# Legacy names expected by many existing codebases:
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# New key names if the codebase or Codex migrates to them:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Google Maps / Places / Geocoding
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
"@ | Set-Content -Path $envFile -Encoding UTF8

Write-Host "Created/updated .env.local at $envFile"
Write-Host "Now open the file, paste your real keys, save, then run the build commands below."

notepad $envFile

Write-Host ""
Write-Host "After saving .env.local, run:" -ForegroundColor Cyan
Write-Host "npm.cmd install"
Write-Host "npm.cmd run build"
Write-Host "npm.cmd run dev"
